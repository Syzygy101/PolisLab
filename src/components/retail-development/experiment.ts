import { account, benchmark, compareAccess, type Path } from './endogenous';

export const modelVersion = 'retail-1';
export const presets = {
  low: { label: 'Lower demand', baskets: 10, works: 30, rent: .4, fee: 1, approval: 1 },
  high: { label: 'Higher demand', baskets: 20, works: 30, rent: .4, fee: 1, approval: 1 },
  timing: { label: 'Opening and welfare horizons', baskets: 40, works: 80, rent: .25, fee: 5, approval: 1 },
  permit: { label: 'Lease and approval', baskets: 45, works: 80, rent: .25, fee: 5, approval: .5 },
} as const;

export type Preset = keyof typeof presets;
export type Draw = 'granted' | 'denied';
export const horizons = [1.25, 2, 3, 9.5] as const;
export type Horizon = typeof horizons[number];

export function parseReplay(params: URLSearchParams) {
  const preset = Object.keys(presets).find(key => key === params.get('scenario')) as Preset | undefined;
  const horizon = horizons.find(value => String(value) === params.get('horizon')) ?? 3;
  const scenario = preset ?? 'timing';
  const draw: Draw = scenario === 'permit' && params.get('approval') === 'denied' ? 'denied' : 'granted';
  return { scenario, horizon, draw };
}

export function replay({ scenario, draw, horizon }: ReturnType<typeof parseReplay>) {
  const input = presets[scenario];
  const game = benchmark(input.baskets, input.works, input.rent);
  game.approval = { date: 0, probability: input.approval };
  const result = compareAccess(game, 'B priority', input.fee);
  const accepted = result.entrantGain >= -1e-9;
  const volunteered = accepted && result.ownerGain > 1e-9;
  function arm(access: boolean) {
    const matching = result.paths(access).filter(path => !access || path.approval === draw);
    const mass = matching.reduce((sum, path) => sum + path.weight, 0);
    if (!mass) throw new RangeError('Approval outcome outside scenario support');
    const histories = matching.map(path => ({
      path,
      accounts: account(path, .04, horizon),
      weight: path.weight / mass,
    }));
    const mean = (read: (entry: typeof histories[number]['accounts']) => number) =>
      histories.reduce((sum, row) => sum + row.weight * read(row.accounts), 0);
    return { access, histories, mean, accounts: {
      consumers: mean(a => a.consumer),
      developerA: mean(a => a.developers[0]), developerB: mean(a => a.developers[1]),
      operatorA: mean(a => a.operators[0]), operatorB: mean(a => a.operators[1]),
      government: mean(a => a.government), welfare: mean(a => a.welfare),
    } };
  }
  const voluntary = arm(volunteered);
  const required = arm(accepted);
  return { game, result, voluntary, required, input };
}

export function openings(path: Path) {
  return path.events.filter(event => event.kind === 'opening');
}
