import { describe, expect, it } from 'vitest';
import { horizons, openings, parseReplay, replay, type Draw, type Preset } from '../../src/components/retail-development/experiment';
import references from '../fixtures/retail-1-reference.json';

describe('retail-1 public reference cases', () => {
  for (const [name, draws] of Object.entries(references)) {
    for (const [outcome, values] of Object.entries(draws)) {
      for (const horizon of horizons) {
        it(`${name} / ${outcome} / ${horizon} years`, () => {
          const reference = values[String(horizon) as keyof typeof values];
          const { required, voluntary } = replay({ scenario: name as Preset, draw: outcome as Draw, horizon });
          expect(required.accounts.welfare - voluntary.accounts.welfare).toBeCloseTo(reference.welfareChange, 7);
          expect(required.histories.flatMap(record => openings(record.path).map(event => [event.site, event.date])))
            .toEqual(reference.requiredOpenings);
          if (outcome === 'denied') {
            expect(required.accounts.developerA - voluntary.accounts.developerA).toBeCloseTo(5);
            expect(required.accounts.developerB - voluntary.accounts.developerB).toBeCloseTo(-5);
          }
        });
      }
    }
  }
  it('normalises unsupported URL input', () => {
    expect(parseReplay(new URLSearchParams('scenario=unknown&approval=denied&horizon=99')))
      .toEqual({ scenario: 'timing', draw: 'granted', horizon: 3 });
  });
});
