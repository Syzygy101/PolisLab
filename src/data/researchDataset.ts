import { ResearchDatasetSchema, type Claim, type ResearchDataset } from '@/research/schema';
import generated from './claims.generated.json';

export const researchDataset: ResearchDataset = ResearchDatasetSchema.parse(generated);

export const allClaims: Claim[] = researchDataset.claims;

export function findClaimById(claimId: string): Claim | undefined {
  return allClaims.find((claim) => claim.claim_id === claimId);
}
