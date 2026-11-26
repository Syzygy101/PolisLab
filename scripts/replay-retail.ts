import { horizons, presets, replay, type Draw, type Preset } from '../src/components/retail-development/experiment';

const publicCases = (Object.keys(presets) as Preset[]).flatMap(scenario => {
  const draws: Draw[] = scenario === 'permit' ? ['granted', 'denied'] : ['granted'];
  return draws.flatMap(draw => horizons.map(horizon => {
    const { game, result, voluntary, required, input } = replay({ scenario, draw, horizon });
    return {
      scenario, draw, horizon, game, rule: 'B priority', fee: input.fee,
      entrantGain: result.entrantGain, ownerGain: result.ownerGain,
      arms: [voluntary, required].map(arm => ({
        access: arm.access, accounts: arm.accounts,
        histories: arm.histories.map(({ path, weight }) => ({ path, weight })),
      })),
    };
  }));
});
console.log(JSON.stringify(publicCases));
