export type Pair<T> = readonly [T, T];
type Interval = Pair<number>;
export type Matrix = Pair<Pair<Pair<number>>>;
export type Equilibrium = Pair<Interval>;
export type Selection = 'A priority' | 'B priority' | 'mixed when available';

export interface ApprovalGate {
  date: number;
  probability: number;
}

const EPS = 1e-10;
const WAIT: Interval = [0, 0];
const ACT: Interval = [1, 1];
const EITHER: Interval = [0, 1];
const supports = [WAIT, ACT, EITHER];
const actions = [0, 1] as const;

function intersect(a: Interval, b: Interval): Interval | null {
  const low = Math.max(a[0], b[0]);
  const high = Math.min(a[1], b[1]);
  return low <= high ? [low, high] : null;
}

// Restrict the opponent's action probability by the focal player's support.
function bestResponseConstraint(gainAtWait: number, gainAtAct: number, support: Interval): Interval | null {
  if (support === EITHER) {
    if (Math.abs(gainAtWait) <= EPS && Math.abs(gainAtAct) <= EPS) return EITHER;
    const slope = gainAtAct - gainAtWait;
    if (Math.abs(slope) <= EPS) return null;
    const root = -gainAtWait / slope;
    return root >= 0 && root <= 1 ? [root, root] : null;
  }
  const sign = support === WAIT ? -1 : 1;
  const a = Math.abs(gainAtWait) <= EPS ? 0 : sign * gainAtWait;
  const b = Math.abs(gainAtAct) <= EPS ? 0 : sign * gainAtAct;
  if (a >= 0 && b >= 0) return EITHER;
  if (a < 0 && b < 0) return null;
  const root = a / (a - b);
  return a >= 0 ? [0, root] : [root, 1];
}

export function equilibria(matrix: Matrix, canAct: Pair<boolean>): Equilibrium[] {
  const constraintA = (support: Interval) => canAct[0]
    ? bestResponseConstraint(matrix[1][0][0] - matrix[0][0][0], matrix[1][1][0] - matrix[0][1][0], support)
    : EITHER;
  const constraintB = (support: Interval) => canAct[1]
    ? bestResponseConstraint(matrix[0][1][1] - matrix[0][0][1], matrix[1][1][1] - matrix[1][0][1], support)
    : EITHER;
  const regions: Equilibrium[] = [];
  for (const a of canAct[0] ? supports : [WAIT]) {
    for (const b of canAct[1] ? supports : [WAIT]) {
      const allowedB = constraintA(a);
      const allowedA = constraintB(b);
      const p = allowedA && intersect(a, allowedA);
      const q = allowedB && intersect(b, allowedB);
      if (p && q) regions.push([p, q]);
    }
  }
  return regions.filter((region, index) => !regions.some((other, j) =>
    j !== index && region.every(([lo, hi], k) => other[k][0] <= lo && other[k][1] >= hi) &&
    (j < index || other.some(([lo, hi], k) => lo < region[k][0] || hi > region[k][1])),
  ));
}

export function select(regions: Equilibrium[], selection: Selection): Pair<number> {
  if (selection === 'mixed when available') {
    const midpoint = ([lo, hi]: Interval) => (lo + hi) / 2;
    const mixed = regions.map(([a, b]) => [midpoint(a), midpoint(b)] as const)
      .find(([p, q]) => p > EPS && q > EPS && p < 1 - EPS && q < 1 - EPS);
    if (mixed) return mixed;
  }
  const side = selection === 'B priority' ? 1 : 0;
  const rival = 1 - side;
  let best: Pair<number> | undefined;
  for (const region of regions) {
    const candidate: Pair<number> = side === 0
      ? [region[0][1], region[1][0]]
      : [region[0][0], region[1][1]];
    if (!best || candidate[side] > best[side] ||
        (candidate[side] === best[side] && candidate[rival] < best[rival])) best = candidate;
  }
  if (!best) throw new Error('No stage equilibrium found');
  return best;
}

function probability(action: number, act: number) {
  return action === 1 ? act : 1 - act;
}

export function average(matrix: Matrix, p: Pair<number>): Pair<number> {
  const value = [0, 0];
  for (const a of actions) {
    for (const b of actions) {
      const weight = probability(a, p[0]) * probability(b, p[1]);
      value[0] += weight * matrix[a][b][0];
      value[1] += weight * matrix[a][b][1];
    }
  }
  return [value[0], value[1]];
}

export function deviation(matrix: Matrix, canAct: Pair<boolean>, p: Pair<number>) {
  const value = average(matrix, p);
  return Math.max(
    average(matrix, [0, p[1]])[0] - value[0],
    average(matrix, [p[0], 0])[1] - value[1],
    canAct[0] ? average(matrix, [1, p[1]])[0] - value[0] : 0,
    canAct[1] ? average(matrix, [p[0], 1])[1] - value[1] : 0,
  );
}
