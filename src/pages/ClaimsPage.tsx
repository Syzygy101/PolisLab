import { useMemo, useState } from 'react';
import { allClaims } from '@/data/researchDataset';
import { ClaimFiltersPanel } from '@/components/claims/ClaimFilters';
import { ClaimsTable } from '@/components/claims/ClaimsTable';
import {
  collectPresentStatuses,
  collectUniqueCases,
  collectUniqueMechanisms,
  collectUniqueOutcomes,
  EMPTY_FILTERS,
  filterClaims,
  filtersAreActive,
  type ClaimFilters,
} from '@/research/queries';

export function ClaimsPage() {
  const [filters, setFilters] = useState<ClaimFilters>(EMPTY_FILTERS);

  const availableStatuses = useMemo(() => collectPresentStatuses(allClaims), []);
  const availableMechanisms = useMemo(() => collectUniqueMechanisms(allClaims), []);
  const availableOutcomes = useMemo(() => collectUniqueOutcomes(allClaims), []);
  const availableCases = useMemo(() => collectUniqueCases(allClaims), []);

  const matched = useMemo(() => filterClaims(allClaims, filters), [filters]);
  const active = filtersAreActive(filters);

  return (
    <div className="space-y-5">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-semibold text-ink">Claims Explorer</h1>
        <p className="max-w-3xl text-sm text-ink-muted">
          Browse all {allClaims.length} authentic research claims from the Policy Claims Atlas.
          Status labels preserve the published vocabulary; hypotheses are not styled as established
          findings. Outcomes O1–O6 remain distinct.
        </p>
      </header>

      <ClaimFiltersPanel
        filters={filters}
        onChange={setFilters}
        availableStatuses={availableStatuses}
        availableMechanisms={availableMechanisms}
        availableOutcomes={availableOutcomes}
        availableCases={availableCases}
        matchCount={matched.length}
        totalCount={allClaims.length}
        active={active}
      />

      <ClaimsTable claims={matched} />
    </div>
  );
}
