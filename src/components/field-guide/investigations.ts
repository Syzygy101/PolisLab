export type EvidenceStep = {
  id: string;
  label: string;
  context?: string;
  heading: string;
  summary: string;
  limit: string;
  section: number;
  claim?: string;
};

export const TRANSACTIONS = {
  private: [
    { id: 'start', label: 'Start a business', heading: 'Starting the business has its own screening rules.', summary: 'Starting a grocery business without acquiring land or an existing business generally does not trigger notification under the ordinary rule. National-security review and voluntary notification remain possible.', limit: 'A subsequent lease or land purchase is a separate decision.', section: 2, claim: 'ATLAS-LEG-001' },
    { id: 'vacant', label: 'Buy vacant land', heading: 'Vacant commercial land generally triggers notification.', summary: 'The published baseline records a zero-dollar notification threshold for private acquisitions of vacant commercial freehold. Productive-use and construction conditions are a separate administrative practice.', limit: 'Check the actual condition and timing before attributing a delay to screening.', section: 2, claim: 'ATLAS-LEG-003' },
    { id: 'developed', label: 'Buy developed land', heading: 'Developed commercial land uses a different threshold.', summary: 'Some private investors qualify for a higher threshold on developed, non-sensitive commercial land. The land classification and investor eligibility matter.', limit: 'The casebook threshold is dated and specific to the eligible investor class.', section: 2, claim: 'ATLAS-LEG-004' },
    { id: 'lease', label: 'Take a lease or option', heading: 'A lease or option can create a land interest.', summary: 'Duration and agreement terms can bring the transaction within land-interest rules. Vacant and developed commercial land have different thresholds.', limit: 'The label on the agreement cannot establish the applicable trigger by itself.', section: 2, claim: 'ATLAS-LEG-005' },
    { id: 'buy', label: 'Buy an existing retailer', heading: 'Buying a retailer follows an acquisition pathway.', summary: 'Buying shares or assets transfers existing capacity. Building new stores and distribution facilities is a different mode of entry.', limit: 'An acquisition alone tells us little about when new capacity would open.', section: 2, claim: 'ATLAS-LIT-005' },
  ],
  government: [
    { id: 'start', label: 'Start a business', heading: 'A foreign government investor must notify when starting a business.', summary: 'The published baseline identifies a start-business notification requirement for foreign government investors.', limit: 'The requirement establishes an obligation. Its effect on the opening date depends on the actual project sequence.', section: 2, claim: 'ATLAS-LEG-002' },
    { id: 'land', label: 'Acquire a land interest', heading: 'Land interests generally carry a zero-dollar threshold.', summary: 'The published baseline treats foreign government investors as a distinct investor class with generally zero-dollar land thresholds.', limit: 'Verify the interest and any applicable exceptions in the dated source.', section: 2 },
  ],
} satisfies Record<string, EvidenceStep[]>;

export const ROLLOUT = {
  sa: [
    { id: 'distribution', context: 'November 2015', label: 'Distribution project', heading: 'Regency Park reaches contract completion.', summary: 'The contractor records completion of its design-and-construction contract in November 2015. The programme supported stock supply for the early-2016 rollout.', limit: 'Contract completion is the documented milestone. The casebook does not give an operational start date.', section: 5, claim: 'ATLAS-EMP-005' },
    { id: 'stores', context: '3 February 2016', label: 'First stores', heading: 'The first South Australian stores open.', summary: 'The dated casebook chronology places the first stores after the recorded Regency Park contract completion.', limit: 'The order does not identify which constraint determined the opening date.', section: 5, claim: 'ATLAS-EMP-005' },
    { id: 'network', context: 'End of 2018', label: 'Store network', heading: 'ALDI reports 29 South Australian stores.', summary: 'The company’s aggregate records network growth after the first openings.', limit: 'Store counts cannot establish price effects or consumer welfare.', section: 5, claim: 'ATLAS-EMP-006' },
  ],
  wa: [
    { id: 'distribution', context: 'Late 2014 to early 2016', label: 'Distribution project', heading: 'The Jandakot project supports the WA rollout.', summary: 'The contractor records a project duration from late 2014 to early 2016.', limit: 'The contractor documents the project period. A precise operating date remains unverified in the published chronology.', section: 5, claim: 'ATLAS-EMP-005' },
    { id: 'stores', context: '8 June 2016', label: 'First stores', heading: 'The first Western Australian stores open.', summary: 'The dated casebook chronology places the first stores after the contractor’s recorded project period.', limit: 'Site assembly, logistics and ordinary sequencing remain competing explanations for timing.', section: 5, claim: 'ATLAS-EMP-005' },
    { id: 'network', context: 'End of 2018', label: 'Store network', heading: 'ALDI reports 41 Western Australian stores.', summary: 'The company reports 41 Western Australian stores and 526 nationally at the end of 2018.', limit: 'The series is a descriptive benchmark for scale. Prices and welfare require separate evidence.', section: 5, claim: 'ATLAS-EMP-006' },
  ],
} satisfies Record<string, EvidenceStep[]>;

export const ACQUISITION = [
  { id: 'notification', context: 'Review route', label: 'Notification', heading: 'A filing starts an administrative process.', summary: 'From 1 January 2026 the published baseline requires notification for qualifying transactions, including additional supermarket rules for major acquirers. Voluntary notification was possible before compulsory commencement.', limit: 'A notification does not establish the decision, settlement, construction or opening.', section: 2, claim: 'ATLAS-LEG-007' },
  { id: 'waiver', context: 'Review route', label: 'Notification waiver', heading: 'A waiver decides whether a filing is required.', summary: 'A grant removes the need to notify, so a notified determination may be bypassed. The substantive prohibition in section 50 continues. Refusal leaves applicable notification and standstill obligations in place.', limit: 'A waiver grant does not establish that the deal is harmless or that it completed.', section: 2, claim: 'ATLAS-LEG-008' },
  { id: 'decision', context: 'Regulatory decision', label: 'Determination', heading: 'A determination decides whether the deal may proceed.', summary: 'After a voluntary notification in November 2025, the ACCC determined that the proposed Coles leasehold acquisition in Kalgoorlie must not be put into effect. Its reasoning concerned a prospective local risk of independent asset exit.', limit: 'The published release distinguishes the ACCC assessment from final Tribunal merits reasoning. Kalgoorlie was a voluntary filing.', section: 5, claim: 'ATLAS-ADM-002' },
  { id: 'completion', context: 'Later observation', label: 'Deal completion', heading: 'Completion requires separate transaction evidence.', summary: 'A dated completion record would establish that the acquisition actually took effect.', limit: 'Control of a site and production of new grocery capacity are different outcomes.', section: 9 },
  { id: 'opening', context: 'Later observation', label: 'Store opening', heading: 'Trading requires its own dated observation.', summary: 'A verified opening would establish that the store began trading. The register events in the published pilot do not independently establish openings.', limit: 'An opening does not by itself identify durable rivalry, a price effect or a welfare gain.', section: 9, claim: 'ATLAS-EMP-007' },
] satisfies EvidenceStep[];

export const GUIDED_COMPARISONS = {
  Case2: {
    a: 'C2-VAR-CF-A', b: 'C2-VAR-CF-C',
    labels: ['Ease vacant-land screening', 'Favour building new capacity'],
    question: 'Which part of the transaction could a policy change?',
    summary: 'Both proposals are hypothetical. The first changes notification handling or conditions on a specific land deal. The second changes the preference between building new capacity and buying it. The casebook identifies the preference as distinct from announced streamlining. Planning and the need to build a distribution network can still affect timing.',
  },
  Case3: {
    a: 'C3-VAR-SITE-FDI', b: 'C3-VAR-FDI-ONLY',
    labels: ['Ease site access or investment screening', 'Ease investment screening alone'],
    question: 'What could easier entry change?',
    summary: 'The casebook compares a broad class of approaches with a world that changes only foreign investment screening. These are analytical comparisons. Distribution capacity and observed opening dates remain separate from any policy effect.',
  },
  Case4: {
    a: 'C4-VAR-B0', b: 'C4-VAR-CF-STRONGER',
    labels: ['Published notification baseline', 'Stronger acquisition rules'],
    question: 'What would stronger acquisition rules change?',
    summary: 'The dated baseline assesses acquisitions case by case. The hypothetical comparison explores separate presumptions, caps and release rules. Neither approach independently creates suitable sites or establishes that a store will open.',
  },
} as const;
