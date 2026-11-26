import { Link, useSearchParams } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { horizons, modelVersion, parseReplay, presets, replay } from '@/components/retail-development/experiment';
import './retail-development.css';

const format = new Intl.NumberFormat('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const numbers = (value: number) => format.format(Math.abs(value) < .005 ? 0 : value);
const signed = (value: number) => value > .005 ? `+${numbers(value)}` : numbers(value);
const actorLabels = {
  consumers: 'Consumer surplus',
  developerA: 'Developer A cash flow',
  developerB: 'Developer B cash flow',
  operatorA: 'Operator A income',
  operatorB: 'Operator B income',
  government: 'Government receipts',
  welfare: 'Total model welfare',
} as const;
const kinds = {
  preparation: 'Preparation', commitment: 'Commitment', works: 'Works',
  opening: 'Opens for trading', lapse: 'Lapse charge', termination: 'Contract ends',
};

export default function RetailDevelopmentPage() {
  useDocumentTitle('Analytical Sandbox');
  const [params, setParams] = useSearchParams();
  const settings = parseReplay(params);
  const { scenario, draw, horizon } = settings;
  const { voluntary, required, input, result } = replay(settings);

  function query(next = settings) {
    return new URLSearchParams({ model: modelVersion, scenario: next.scenario,
      approval: next.draw, horizon: String(next.horizon) });
  }
  function update(key: string, value: string) {
    const next = query();
    next.set(key, value);
    setParams(query(parseReplay(next)), { preventScrollReset: true });
  }

  if (params.has('model') && params.get('model') !== modelVersion) {
    return <article className="retail-development"><h1>Analytical Sandbox</h1>
      <p>This hypothetical replay uses an unavailable model version.</p>
      <Link to="/sandbox">Open the current experiment</Link></article>;
  }

  return <article className="retail-development">
    <header>
      <p className="page-kicker">Analytical Sandbox · Hypothetical computational experiment</p>
      <h1>When does a required offer change supermarket entry?</h1>
      <p>Compare a required offer with voluntary site access. Follow the same lease terms through approval, construction
        and trading, then change the welfare horizon to see which costs and benefits it captures.</p>
    </header>
    <fieldset className="retail-controls">
      <legend>Set the comparison</legend>
      <label><span id="retail-scenario-label">Scenario</span>
        <select aria-labelledby="retail-scenario-label" value={scenario} onChange={event => update('scenario', event.currentTarget.value)}>
          {Object.entries(presets).map(([key, spec]) => <option key={key} value={key}>{spec.label}</option>)}
        </select>
      </label>
      <label><span id="retail-approval-label">Approval outcome</span>
        <select aria-labelledby="retail-approval-label" value={draw} onChange={event => update('approval', event.currentTarget.value)}>
          <option value="granted">Grant</option>
          {scenario === 'permit' && <option value="denied">Denial</option>}
        </select>
      </label>
      <label><span id="retail-horizon-label">Welfare horizon</span>
        <select aria-labelledby="retail-horizon-label" value={horizon} onChange={event => update('horizon', event.currentTarget.value)}>
          {horizons.map(value => <option key={value} value={value}>
            {value === 9.5 ? 'Full contract run-out' : `${value} years`}</option>)}
        </select>
      </label>
    </fieldset>
    <p>{input.baskets} potential baskets per year · {input.works} units of works cost per site ·
      {' '}{input.rent * 100}% rent share · {input.fee} units upfront fee ·
      {' '}{input.approval * 100}% private probability of a fresh grant before resolution.</p>
    <section className="retail-result" aria-label="Comparison result" aria-live="polite" aria-atomic="true">
      <p>Required offer minus voluntary access</p>
      <strong>{signed(required.accounts.welfare - voluntary.accounts.welfare)} welfare units</strong>
      <p>Present value over {horizon} years at a hypothetical 4% social discount rate.
        {' '}Developer B’s private gain from accepting the site lease is {signed(result.entrantGain)} units.</p>
    </section>
    <div className="retail-timelines">
      {([['Voluntary access', voluntary], ['Required offer', required]] as const).map(([title, arm]) => {
        return <section key={title}>
          <h2>{title}</h2>
          <p>{arm.access ? `Lease accepted. Developer B pays ${input.fee} to A at year 0. Fresh approval: ${draw}.`
            : title === 'Voluntary access' ? 'Site B is retained.' : 'Developer B refuses the lease.'}</p>
          {arm.histories.map(({ path, weight }, i) => <div key={i}>
            {arm.histories.length > 1 && <h3>History {i + 1} · {(weight * 100).toFixed(1)}%</h3>}
            {path.events.length ? <ol>
              {path.events.map(event => <li key={`${event.site}-${event.kind}`}>
                Year {event.date} · Site {event.site === 0 ? 'A' : 'B'} · {kinds[event.kind]}
              </li>)}
            </ol> : <p>Neither site starts development.</p>}
          </div>)}
        </section>;
      })}
    </div>
    <section aria-labelledby="retail-accounts">
      <h2 id="retail-accounts">Actor accounts</h2>
      <table>
        <caption>Hypothetical present values in model units</caption>
        <thead><tr><th scope="col">Account</th><th scope="col">Voluntary</th><th scope="col">Required</th>
          <th scope="col">Change</th></tr></thead>
        <tbody>{Object.entries(actorLabels).map(([key, label]) => {
          const field = key as keyof typeof actorLabels;
          return <tr key={key}><th scope="row">{label}</th><td>{numbers(voluntary.accounts[field])}</td>
            <td>{numbers(required.accounts[field])}</td>
            <td>{signed(required.accounts[field] - voluntary.accounts[field])}</td></tr>;
        })}</tbody>
      </table>
    </section>
    <details>
      <summary>Reproduce the calculation</summary>
      <p>At each decision date the developers choose whether to prepare, then whether to commit.
        Preparation costs 5 units and takes half a year. Irreversible works start on commitment.
        Opening follows half a year later and costs 8 units. Trading lasts eight years from opening.
        The latest possible end date is year 9.5.</p>
      <p>Potential baskets choose between trading stores and an outside option. Retailers price simultaneously.
        Each basket costs its store 5 units. Store utility is 4 minus 0.35 times price. The outside option has utility zero.
        Developers earn the displayed share of contribution after basket costs. Operators keep the remainder.</p>
      <p>Private values use an 8% continuous discount rate. The lease is signed before the fresh approval outcome
        resolves at year zero. The social ledger adds consumer surplus and retail contribution, then deducts
        development resource costs. Dated payments at the selected horizon are included.</p>
      <p id="retail-transfer-derivation">Transfer accounting follows directly from the actor balances.
        A receives the fee and B pays the same amount at signing, so their combined fee entry is zero.
        In each trading period the developer receives the rent and the operator keeps the gross contribution
        minus rent. Adding the two gives the original gross contribution.</p>
    </details>
    <section aria-labelledby="retail-provenance">
      <h2 id="retail-provenance">Methods and evidence</h2>
      <p><strong>Hypothetical computational experiment.</strong> Model {modelVersion} uses constant potential demand,
        fixed contracts and pre-contracted operators over three six-month decision dates. The B-priority
        continuation rule selects developer actions where the game has multiple solutions.</p>
      <p><strong>Theoretical result.</strong> An upfront lease fee moves the same amount between the developers.
        The fee cancels from welfare when both developers are included and the fee has no resource cost.
        {' '}<a href="#retail-transfer-derivation">Read the accounting derivation</a>.</p>
      <p><strong>Published evidence.</strong> The v0.1.1 <Link to="/claims">claims atlas</Link> and
        {' '}<Link to="/casebook">casebook</Link> describe the documented evidence and its limits.
        This experiment uses synthetic inputs.</p>
      <Link to={`/sandbox?${query()}`}>Open exact hypothetical replay · {modelVersion}</Link>
    </section>
  </article>;
}
