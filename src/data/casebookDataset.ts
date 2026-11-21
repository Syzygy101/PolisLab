import { CasebookDatasetSchema, type CasebookDataset } from '@/research/casebookSchema';
import type { CaseId } from '@/research/taxonomy';
import type { ParsedCase } from '@/research/casebookSchema';
import generated from './casebook.generated.json';

export const casebookDataset: CasebookDataset = CasebookDatasetSchema.parse(generated);

export function getCasebookCase(caseId: CaseId): ParsedCase | undefined {
  return casebookDataset.cases.find((c) => c.id === caseId);
}
