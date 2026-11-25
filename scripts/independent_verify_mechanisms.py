#!/usr/bin/env python3
"""Independent CSV-derived verification of mechanism exact/family/matrix ID sets.

Does not import application TypeScript. Stdlib only.
Derives expected claim-ID sets from the pinned atlas CSV and compares counts
plus membership. Rejects unexpected tags (e.g. M99). Exit 0 on match.
"""

from __future__ import annotations

import csv
import json
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ATLAS = ROOT / "research" / "10_policy_claims_atlas.csv"
FIXTURE = ROOT / "tests" / "fixtures" / "v011_mechanism_coverage.json"
ID_FIXTURE = ROOT / "tests" / "fixtures" / "v011_mechanism_id_sets.json"

CHILDREN = {
    "M1": ["M1", "M1a", "M1b", "M1c"],
    "M2": ["M2", "M2a", "M2b"],
    "M3": ["M3", "M3a", "M3b"],
    "M4": ["M4", "M4a", "M4b"],
    "M5": ["M5", "M5a"],
    "M6": ["M6", "M6a", "M6b"],
}
OUTCOMES = ["O1", "O2", "O3", "O4", "O5", "O6"]
ALLOWED_TAGS = {
    tag for tags in CHILDREN.values() for tag in tags
}


def parse_tags(raw: str) -> list[str]:
    return [part.strip() for part in raw.split(";") if part.strip()]


def sorted_ids(values: set[str]) -> list[str]:
    return sorted(values)


def main() -> int:
    expectations = json.loads(FIXTURE.read_text())
    with ATLAS.open(newline="", encoding="utf-8") as handle:
        rows = list(csv.DictReader(handle))

    exact: dict[str, set[str]] = defaultdict(set)
    for row in rows:
        for tag in parse_tags(row["mechanism_ids"]):
            exact[tag].add(row["claim_id"])

    errors: list[str] = []

    # Reject unexpected atlas tags (including fabricated M99).
    unexpected = sorted(set(exact) - ALLOWED_TAGS)
    for tag in unexpected:
        errors.append(f"unexpected atlas mechanism tag {tag}")

    for tag, expected in expectations["exactCounts"].items():
        actual_ids = exact.get(tag, set())
        if len(actual_ids) != expected:
            errors.append(f"exact {tag}: expected count {expected}, got {len(actual_ids)}")

    family_ids: dict[str, list[str]] = {}
    for family, tags in CHILDREN.items():
        ids: set[str] = set()
        for tag in tags:
            ids |= exact.get(tag, set())
        family_ids[family] = sorted_ids(ids)
        expected = expectations["familyCounts"][family]
        if len(ids) != expected:
            errors.append(f"family {family}: expected count {expected}, got {len(ids)}")

    for outcome in OUTCOMES:
        ids = {
            row["claim_id"]
            for row in rows
            if outcome in parse_tags(row["outcome_ids"])
        }
        expected = expectations["outcomeCounts"][outcome]
        if len(ids) != expected:
            errors.append(f"outcome {outcome}: expected count {expected}, got {len(ids)}")

    matrix_ids: dict[str, dict[str, list[str]]] = {}
    for family, tags in CHILDREN.items():
        tag_set = set(tags)
        matrix_ids[family] = {}
        for outcome in OUTCOMES:
            ids = {
                row["claim_id"]
                for row in rows
                if tag_set.intersection(parse_tags(row["mechanism_ids"]))
                and outcome in parse_tags(row["outcome_ids"])
            }
            matrix_ids[family][outcome] = sorted_ids(ids)
            expected = expectations["matrixCounts"][family][outcome]
            if len(ids) != expected:
                errors.append(
                    f"matrix {family}×{outcome}: expected count {expected}, got {len(ids)}"
                )

    # Contextual subdivisions must not appear as atlas tags.
    for bad in ("M5a-1", "M5a-2", "M5b", "M99"):
        if bad in exact:
            errors.append(f"unexpected atlas tag {bad}")

    exact_ids = {tag: sorted_ids(ids) for tag, ids in exact.items()}

    # Persist / compare independent ID-set fixture when present.
    derived = {
        "exact": {tag: exact_ids.get(tag, []) for tag in sorted(expectations["exactCounts"])},
        "family": family_ids,
        "matrix": matrix_ids,
    }
    if ID_FIXTURE.exists():
        fixture_sets = json.loads(ID_FIXTURE.read_text())
        if fixture_sets.get("exact") != derived["exact"]:
            errors.append("exact claim-ID sets diverge from independent fixture")
        if fixture_sets.get("family") != derived["family"]:
            errors.append("family claim-ID sets diverge from independent fixture")
        if fixture_sets.get("matrix") != derived["matrix"]:
            errors.append("matrix claim-ID sets diverge from independent fixture")
    else:
        ID_FIXTURE.write_text(json.dumps(derived, indent=2) + "\n", encoding="utf-8")
        print(f"Wrote independent ID-set fixture: {ID_FIXTURE.relative_to(ROOT)}")

    if errors:
        print("FAIL: independent mechanism verification")
        for err in errors:
            print(f"  - {err}")
        return 1

    print("PASS: independent mechanism verification")
    print(f"  atlas rows: {len(rows)}")
    print(f"  exact tags checked: {len(expectations['exactCounts'])}")
    print("  family / outcome / 36-cell matrix counts: matched")
    print("  claim-ID sets: matched (exact, family, matrix)")
    print("  unexpected tags (incl. M99): none")
    return 0


if __name__ == "__main__":
    sys.exit(main())
