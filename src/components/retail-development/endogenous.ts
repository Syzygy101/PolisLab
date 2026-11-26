import { priceMarket, type RetailInputs, type StoreCount } from './retail';
import { average, deviation, equilibria, select, type ApprovalGate, type Matrix, type Pair, type Selection } from './strategic';

export const sites = [0, 1] as const;
type Site = typeof sites[number];
type Approval = 'pending' | 'granted' | 'denied';
type Phase = 'prepare' | 'commit';
type SiteState =
  | { phase: 'idle' }
  | { phase: 'prepared'; ready: number }
  | { phase: 'committed'; works: number }
  | { phase: 'works'; opens: number }
  | { phase: 'trading'; ends: number }
  | { phase: 'closed' };

export interface Project {
  access: boolean;
  deadline: number;
  lead: number;
  lag: number;
  mobilisation?: number;
  preparation: number;
  construction: number;
  fitOut: number;
  lapse: number;
  salvage: number;
  closingCost: number;
  initiallyTrading?: boolean;
}

export interface Game {
  projects: Pair<Project>;
  market: RetailInputs;
  privateRate: number;
  step: number;
  term: number;
  approval?: ApprovalGate;
}

interface Event {
  date: number;
  site: Site;
  kind: 'preparation' | 'commitment' | 'works' | 'opening' | 'termination' | 'lapse';
  amount: number;
  salvage?: number;
}

interface Period {
  from: number;
  to: number;
  trading: Site[];
  market: ReturnType<typeof priceMarket>;
}

export interface Path {
  events: Event[];
  periods: Period[];
  approval: Approval;
  weight: number;
  fee: number;
}

const actions = [[0, 0], [0, 1], [1, 0], [1, 1]] as const;
type Action = typeof actions[number];
const tolerance = 1e-9;
const pair = <T,>(f: (i: Site) => T): Pair<T> => [f(0), f(1)];
const integrate = (rate: number, duration: number) => rate ? -Math.expm1(-rate * duration) / rate : duration;

export function account(path: Path, rate: number, horizon = Infinity,
  terminal: 'contract' | 'zero sale value' = 'contract') {
  const developers = [path.fee, -path.fee];
  const operators = [0, 0];
  let consumer = 0;
  let government = 0;
  let realNetCost = 0;
  let grossMargin = 0;
  for (const event of path.events) {
    // Horizon includes dated obligations exactly at its right boundary.
    if (event.date > horizon) continue;
    const salvage = terminal === 'contract' ? (event.salvage ?? 0) : 0;
    const cost = (event.amount - salvage) * Math.exp(-rate * event.date);
    developers[event.site] -= cost;
    if (event.kind === 'lapse') government += cost;
    else realNetCost += cost;
  }
  for (const period of path.periods) {
    const length = Math.min(period.to, horizon) - period.from;
    if (length <= 0) continue;
    const weight = Math.exp(-rate * period.from) * integrate(rate, length);
    consumer += weight * period.market.consumerSurplus;
    period.trading.forEach((site, i) => {
      developers[site] += weight * period.market.rents[i];
      operators[site] += weight * period.market.operatorIncome[i];
      grossMargin += weight * period.market.contributions[i];
    });
  }
  return { developers, operators, consumer, government, realNetCost, grossMargin,
    welfare: consumer + grossMargin - realNetCost };
}

export function solve(game: Game, rule: Selection) {
  const { market, projects, privateRate, step, approval } = game;
  if (!Number.isFinite(step) || step <= 0 || !Number.isFinite(privateRate) || privateRate < 0)
    throw new RangeError('Invalid decision interval or private discount rate');
  function ticks(date: number) {
    const n = Math.round(date / step);
    if (!Number.isSafeInteger(n) || n < 0 || n > 24 || Math.abs(n * step - date) > tolerance)
      throw new RangeError('Dates must align with the small decision grid');
    return n;
  }
  const term = ticks(game.term);
  const gateDate = approval ? ticks(approval.date) : -1;
  if (!term || (approval && !(approval.probability >= 0 && approval.probability <= 1))
    || projects.some(p => ![p.preparation, p.construction, p.fitOut, p.lapse, p.salvage, p.closingCost]
      .every(value => Number.isFinite(value) && value >= 0)
      || (p.initiallyTrading && !p.access))) throw new RangeError('Invalid contract or project terms');

  const spec = pair(i => ({ ...projects[i], deadline: ticks(projects[i].deadline),
    lead: ticks(projects[i].lead), lag: ticks(projects[i].lag), mobilisation: ticks(projects[i].mobilisation ?? 0) }));
  const lastDecision = Math.max(...spec.map(p => p.deadline));
  // Forward replay expands mixed branches. The bounded experiment intentionally has three decision dates.
  if (lastDecision > 2) throw new RangeError('Use at most three investment dates in this benchmark');
  if (gateDate > lastDecision) throw new RangeError('Approval must resolve by the final decision');
  const end = Math.max(...spec.map(p => p.deadline + p.mobilisation + p.lag + term));
  const marketByCount = ([0, 1, 2] as const).map(count => priceMarket(count, market));
  const discount = Math.exp(-privateRate * step);
  const annuity = integrate(privateRate, step);
  const initial = pair<SiteState>(i => spec[i].initiallyTrading ? { phase: 'trading', ends: term }
    : spec[i].preparation === 0 && spec[i].lead === 0 ? { phase: 'prepared', ready: 0 } : { phase: 'idle' });
  type State = typeof initial;
  interface Node {
    value: Pair<number>;
    policy: Pair<number>;
    regions: ReturnType<typeof equilibria>;
    feasible: Pair<boolean>;
  }
  const memo = new Map<string, Node>();
  let maxDeviation = 0;
  let multiple = 0;

  function outcomes(t: number, status: Approval): [Approval, number][] {
    if (status !== 'pending' || t !== gateDate || !approval) return [[status, 1]];
    const branches: [Approval, number][] = [['granted', approval.probability], ['denied', 1 - approval.probability]];
    return branches.filter(([, weight]) => weight > 0);
  }
  const add = (a: Pair<number>, b: Pair<number>, weight = 1) => pair(i => a[i] + b[i] * weight);

  function activate(t: number, i: Site, state: SiteState, events: Event[]): SiteState {
    if (state.phase === 'committed' && state.works === t) {
      events.push({ site: i, date: t * step, kind: 'works', amount: spec[i].construction });
      state = { phase: 'works', opens: t + spec[i].lag };
    }
    if (state.phase === 'works' && state.opens === t) {
      events.push({ site: i, date: t * step, kind: 'opening', amount: spec[i].fitOut });
      return { phase: 'trading', ends: t + term };
    }
    if (state.phase === 'trading' && state.ends === t) {
      events.push({ site: i, date: t * step, kind: 'termination',
        amount: spec[i].closingCost, salvage: spec[i].salvage });
      return { phase: 'closed' };
    }
    return state;
  }

  function transition(t: number, s: State, status: Approval, phase: Phase, action: Action) {
    const events: Event[] = [];
    const next = pair<SiteState>(i => {
      const p = spec[i];
      if (phase === 'prepare') {
        if (!action[i]) return s[i];
        events.push({ site: i, date: t * step, kind: 'preparation', amount: p.preparation });
        return { phase: 'prepared', ready: t + p.lead };
      }
      if (action[i]) {
        events.push({ site: i, date: t * step, kind: 'commitment', amount: 0 });
        return activate(t, i, { phase: 'committed', works: t + p.mobilisation }, events);
      }
      const state = s[i];
      if (t === p.deadline && p.access && (i === 0 || status === 'granted')
        && ['idle', 'prepared'].includes(state.phase) && p.lapse)
        events.push({ site: i, date: t * step, kind: 'lapse', amount: p.lapse });
      return state;
    });
    return { next, events };
  }

  function period(t: number, s: State): Period {
    const trading = sites.filter(i => s[i].phase === 'trading');
    return { from: t * step, to: (t + 1) * step, trading, market: marketByCount[trading.length as StoreCount] };
  }
  const cost = (events: Event[]) => pair(i => -events.filter(e => e.site === i).reduce((sum, e) => sum + e.amount - (e.salvage ?? 0), 0));

  function dateValue(t: number, s: State, status: Approval): Pair<number> {
    const events: Event[] = [];
    const current = pair(i => activate(t, i, s[i], events));
    if (t === end) return cost(events);
    const continuation = outcomes(t, status).reduce<Pair<number>>(
      (sum, [resolved, weight]) => add(sum, node(t, current, resolved, 'prepare').value, weight), [0, 0]);
    return add(cost(events), continuation);
  }

  function node(t: number, s: State, status: Approval, phase: Phase): Node {
    const key = JSON.stringify([t, s, status, phase]);
    const saved = memo.get(key);
    if (saved) return saved;
    const feasible = pair(i => {
      const p = spec[i];
      const state = s[i];
      if (!p.access || t > p.deadline || (i === 1 && status !== 'granted')) return false;
      return phase === 'prepare' ? state.phase === 'idle' && t + p.lead <= p.deadline
        : state.phase === 'prepared' && state.ready <= t;
    });
    const payoff = (action: Action): Pair<number> => {
      if (sites.some(i => action[i] && !feasible[i])) return [0, 0];
      const { next, events } = transition(t, s, status, phase, action);
      const immediate = cost(events);
      if (phase === 'prepare') return add(immediate, node(t, next, status, 'commit').value);
      const flow = period(t, next);
      const rent = pair(i => flow.market.rents[flow.trading.indexOf(i)] ?? 0);
      return add(add(immediate, rent, annuity), dateValue(t + 1, next, status), discount);
    };
    const matrix: Matrix = [[payoff(actions[0]), payoff(actions[1])], [payoff(actions[2]), payoff(actions[3])]];
    const regions = equilibria(matrix, feasible);
    const policy = select(regions, rule);
    maxDeviation = Math.max(maxDeviation, deviation(matrix, feasible, policy));
    for (const [[loA, hiA], [loB, hiB]] of regions) {
      for (const p of [loA, hiA]) for (const q of [loB, hiB])
        maxDeviation = Math.max(maxDeviation, deviation(matrix, feasible, [p, q]));
    }
    if (regions.length > 1 || regions.some(region => region.some(([lo, hi]) => hi > lo))) multiple++;
    const result = { value: average(matrix, policy), policy, regions, feasible };
    memo.set(key, result);
    return result;
  }

  const startingApproval: Approval = approval ? 'pending' : 'granted';
  const value = dateValue(0, initial, startingApproval);
  // Enumerate positive-probability histories forward under the selected continuation.
  const paths: Path[] = [];
  function replay(t: number, s: State, path: Path) {
    const events = [...path.events];
    const current = pair(i => activate(t, i, s[i], events));
    if (t === end) {
      paths.push({ ...path, events });
      return;
    }
    for (const [resolved, chance] of outcomes(t, path.approval)) {
      for (const prep of actions) {
        const p = actionWeight(prep, node(t, current, resolved, 'prepare').policy);
        if (!p) continue;
        const ready = transition(t, current, resolved, 'prepare', prep);
        for (const start of actions) {
          const q = actionWeight(start, node(t, ready.next, resolved, 'commit').policy);
          if (!q) continue;
          const construction = transition(t, ready.next, resolved, 'commit', start);
          replay(t + 1, construction.next, { approval: resolved, fee: 0, weight: path.weight * chance * p * q,
            events: [...events, ...ready.events, ...construction.events],
            periods: [...path.periods, period(t, construction.next)] });
        }
      }
    }
  }
  replay(0, initial, { approval: startingApproval, fee: 0, weight: 1, events: [], periods: [] });
  const forward = paths.reduce<Pair<number>>((sum, path) => {
    const { developers } = account(path, privateRate);
    return add(sum, [developers[0], developers[1]], path.weight);
  }, [0, 0]);
  const root = outcomes(0, startingApproval).map(([status, weight]) =>
    ({ status, weight, ...node(0, initial, status, 'prepare') }));
  return { value, forward, paths, root, nodes: memo.size, maxDeviation, multiple };
}

function actionWeight(action: Action, policy: Pair<number>) {
  return (action[0] ? policy[0] : 1 - policy[0]) * (action[1] ? policy[1] : 1 - policy[1]);
}

export function compareAccess(game: Game, rule: Selection, fee: number) {
  if (!Number.isFinite(fee) || fee < 0 || game.projects[1].initiallyTrading) throw new RangeError('Invalid lease');
  const retained = solve({ ...game, approval: undefined, projects: [game.projects[0],
    { ...game.projects[1], access: false }] }, rule);
  const licensed = solve({ ...game, projects: [game.projects[0], { ...game.projects[1], access: true }] }, rule);
  const entrantGain = licensed.value[1] - fee - retained.value[1];
  const ownerGain = licensed.value[0] + fee - retained.value[0];
  const responses = (['refuse', 'accept'] as const).filter(response =>
    response === 'accept' ? entrantGain >= -tolerance : entrantGain <= tolerance);
  const branches = responses.map(response => ({
    required: response,
    voluntary: (['retain', 'offer'] as const).filter(choice => {
      const gain = response === 'accept' ? ownerGain : 0;
      return choice === 'offer' ? gain >= -tolerance : gain <= tolerance;
    }),
  }));
  const paths = (accepted: boolean) => accepted ? licensed.paths.map(path => ({ ...path, fee })) : retained.paths;
  return { retained, licensed, entrantGain, ownerGain, branches, paths };
}

export function benchmark(baskets = 20, construction = 80, rentShare = .25, cost = 5): Game {
  const site: Project = { access: true, deadline: 1, lead: .5, lag: .5, preparation: 5,
    construction, fitOut: 8, lapse: 0, closingCost: 0, salvage: 0 };
  return { step: .5, term: 8, privateRate: .08,
    market: { cost, attractiveness: 4, sensitivity: .35, baskets, rentShare },
    projects: [site, site] };
}
