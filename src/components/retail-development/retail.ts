export interface RetailInputs {
  cost: number;
  attractiveness: number;
  sensitivity: number;
  baskets: number;
  rentShare: number;
}

export type StoreCount = 0 | 1 | 2;

export function demand(prices: readonly number[], { attractiveness, sensitivity, baskets }: RetailInputs) {
  const utilities = [0, ...prices.map(price => attractiveness - sensitivity * price)];
  const pivot = Math.max(...utilities);
  const weights = utilities.map(utility => Math.exp(utility - pivot));
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  const shares = weights.slice(1).map(weight => weight / total);
  return {
    shares,
    quantities: shares.map(share => baskets * share),
    outsideShare: weights[0] / total,
    consumerSurplus: baskets / sensitivity * (pivot ? pivot + Math.log(total)
      : Math.log1p(weights.slice(1).reduce((sum, weight) => sum + weight, 0))),
  };
}

export function priceMarket(count: StoreCount, inputs: RetailInputs) {
  const { attractiveness, cost, sensitivity, baskets, rentShare } = inputs;
  if (![0, 1, 2].includes(count) || !Object.values(inputs).every(Number.isFinite)
    || attractiveness < -2 || attractiveness > 8 || cost < 0 || cost > 40
    || sensitivity < .05 || sensitivity > 1 || baskets <= 0 || baskets > 100
    || rentShare < 0 || rentShare >= 1) throw new RangeError('Retail inputs outside the bounded experiment');

  // Solve for excess dimensionless markup y = beta*(price - c) - 1.
  // y = w / (1 + (n - 1)*w), where w decreases strictly in y.
  const netAttractiveness = attractiveness - sensitivity * cost;
  let low = 0;
  let high = 1 + Math.max(0, netAttractiveness);
  for (let i = 0; count && i < 80; i++) {
    const middle = (low + high) / 2;
    const weight = Math.exp(netAttractiveness - 1 - middle);
    if (middle < weight / (1 + (count - 1) * weight)) low = middle;
    else high = middle;
  }
  const markup = (1 + (low + high) / 2) / sensitivity;
  const price = cost + markup;
  const market = demand(Array<number>(count).fill(price), inputs);
  const contributions = market.quantities.map(quantity => markup * quantity);
  return {
    ...market,
    price: count ? price : null,
    contributions,
    rents: contributions.map(value => rentShare * value),
    operatorIncome: contributions.map(value => (1 - rentShare) * value),
  };
}
