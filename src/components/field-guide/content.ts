import type { CaseId } from '@/research/taxonomy';

export const FIELD_GUIDE = {
  Case1: {
    topic: 'Undeveloped supermarket sites',
    question: 'What keeps a new supermarket out?',
    description: 'Examine site viability, planning, investment timing and control, then compare two proposals that could change who gets access.',
  },
  Case2: {
    topic: 'Foreign grocery investment',
    question: 'What can delay a foreign retailer’s first store?',
    description: 'Change the investor or transaction to see which screening rules could affect a new store.',
  },
  Case3: {
    topic: 'Grocery entry and scale',
    question: 'How does a new grocery chain build a store network?',
    description: 'Follow ALDI’s distribution investment and store openings in South Australia and Western Australia.',
  },
  Case4: {
    topic: 'Supermarket acquisition oversight',
    question: 'What happens after a supermarket acquisition is reviewed?',
    description: 'Follow the evidence from notification and waiver to the separate milestones of completion and opening.',
  },
} satisfies Record<CaseId, { topic: string; question: string; description: string }>;

export const RESEARCH_MODULES = [
  { title: 'Evidence library', href: '/claims', description: 'Inspect claims, sources and qualifications.' },
  { title: 'Mechanisms', href: '/mechanisms', description: 'Trace competing explanations and their conditions.' },
  { title: 'Compare policies', href: '/comparison', description: 'Read published baselines and proposals side by side.' },
  { title: 'Research gaps', href: '/gaps', description: 'Find observations that could change an assessment.' },
] as const;
