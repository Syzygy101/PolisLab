#!/usr/bin/env python3
"""
Independent Build 01 source-fidelity verifier.

Uses only Python's standard library (csv, json, hashlib, subprocess).
Does NOT import or reuse application ingestion, schemas, or query helpers.
Compares the published Git commit atlas to the working-tree CSV and generated JSON.
"""

from __future__ import annotations

import csv
import hashlib
import io
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLISHED_COMMIT = "a1922f8a8d08f59749d34de306e1b7406f9fe10b"
ATLAS_REL = "research/10_policy_claims_atlas.csv"
GENERATED_REL = "src/data/claims.generated.json"
EXPECTED_COUNT = 43
EXPECTED_SHA256 = "cdb874f2637fca62c7170d5176eacd02ad2f86096f857a35b245208d9e1473af"

# Original atlas fields only (derived application metadata excluded).
SOURCE_FIELDS = [
    "claim_id",
    "exact_claim",
    "mechanism_ids",
    "outcome_ids",
    "institutional_geographic_scope",
    "status",
    "primary_source_title",
    "primary_source_url",
    "source_date_or_version",
    "pinpoint",
    "what_source_establishes",
    "limitations_external_validity",
    "competing_mechanism_or_contrary_evidence",
    "observation_that_would_alter_assessment",
    "admissible_in_policy_comparison",
    "admissibility_conditions",
    "casebook_cases",
    "literature_src_ids",
]

DERIVED_FIELDS = {
    "mechanisms",
    "outcomes",
    "cases",
    "literatureSources",
    "hasPrimarySourceUrl",
}


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def git_show(commit: str, path: str) -> bytes:
    return subprocess.check_output(["git", "show", f"{commit}:{path}"], cwd=ROOT)


def parse_csv(text: str) -> tuple[list[str], list[dict[str, str]]]:
    reader = csv.DictReader(io.StringIO(text))
    if reader.fieldnames is None:
        raise SystemExit("CSV has no headers")
    headers = list(reader.fieldnames)
    rows: list[dict[str, str]] = []
    for row in reader:
        # Preserve exact string values; DictReader yields str|None for missing cells.
        normalised = {k: ("" if row.get(k) is None else row[k]) for k in headers}
        rows.append(normalised)
    return headers, rows


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def compare_records(
    label_a: str,
    rows_a: list[dict[str, str]],
    label_b: str,
    rows_b: list[dict[str, str]],
    fields: list[str],
) -> tuple[int, int, list[str]]:
    """Compare original fields by claim_id. Returns (comparisons, mismatches, details)."""
    by_a = {r["claim_id"]: r for r in rows_a}
    by_b = {r["claim_id"]: r for r in rows_b}
    details: list[str] = []
    comparisons = 0
    mismatches = 0

    only_a = sorted(set(by_a) - set(by_b))
    only_b = sorted(set(by_b) - set(by_a))
    if only_a:
        mismatches += len(only_a)
        details.append(f"IDs only in {label_a}: {only_a}")
    if only_b:
        mismatches += len(only_b)
        details.append(f"IDs only in {label_b}: {only_b}")

    for claim_id in sorted(set(by_a) & set(by_b)):
        a = by_a[claim_id]
        b = by_b[claim_id]
        for field in fields:
            comparisons += 1
            va = a.get(field, "")
            vb = b.get(field, "")
            # Exact comparison — no trim / case fold / whitespace normalisation.
            if va != vb:
                mismatches += 1
                details.append(
                    f"{claim_id}.{field}: {label_a}={va!r} != {label_b}={vb!r}"
                )
    return comparisons, mismatches, details


def main() -> int:
    print("=== Independent atlas fidelity verification ===")
    print(f"Published commit: {PUBLISHED_COMMIT}")
    print(f"Workspace: {ROOT}")

    published_bytes = git_show(PUBLISHED_COMMIT, ATLAS_REL)
    published_sha = sha256_bytes(published_bytes)
    print(f"Published atlas SHA-256: {published_sha}")

    working_path = ROOT / ATLAS_REL
    working_bytes = working_path.read_bytes()
    working_sha = sha256_bytes(working_bytes)
    print(f"Working atlas SHA-256:   {working_sha}")

    generated_path = ROOT / GENERATED_REL
    if not generated_path.exists():
        print(f"FAIL: missing generated dataset {GENERATED_REL}")
        return 1

    generated = load_json(generated_path)
    reported_sha = generated.get("provenance", {}).get("sourceContentSha256")
    print(f"Reported provenance SHA: {reported_sha}")

    errors: list[str] = []

    if published_sha != EXPECTED_SHA256:
        errors.append(
            f"Published atlas SHA mismatch vs expected constant: {published_sha}"
        )
    if working_sha != published_sha:
        errors.append("Working-tree atlas is not byte-identical to published commit")
    if reported_sha != working_sha:
        errors.append(
            f"Provenance checksum {reported_sha!r} != independent working SHA {working_sha!r}"
        )

    pub_headers, pub_rows = parse_csv(published_bytes.decode("utf-8"))
    work_headers, work_rows = parse_csv(working_bytes.decode("utf-8"))

    print(f"Published headers ({len(pub_headers)}): {pub_headers}")
    print(f"Published records: {len(pub_rows)}")
    print(f"Working records:   {len(work_rows)}")

    if pub_headers != SOURCE_FIELDS:
        errors.append(f"Published headers != expected 18 fields: {pub_headers}")
    if work_headers != SOURCE_FIELDS:
        errors.append(f"Working headers != expected 18 fields: {work_headers}")
    if len(pub_rows) != EXPECTED_COUNT:
        errors.append(f"Published count {len(pub_rows)} != {EXPECTED_COUNT}")
    if len(work_rows) != EXPECTED_COUNT:
        errors.append(f"Working count {len(work_rows)} != {EXPECTED_COUNT}")

    pub_ids = [r["claim_id"] for r in pub_rows]
    if len(pub_ids) != len(set(pub_ids)):
        errors.append("Duplicate claim_id values in published atlas")

    gen_claims = generated.get("claims", [])
    print(f"Generated records: {len(gen_claims)}")
    if len(gen_claims) != EXPECTED_COUNT:
        errors.append(f"Generated count {len(gen_claims)} != {EXPECTED_COUNT}")

    # Map generated claims back to original-field dicts.
    gen_as_source: list[dict[str, str]] = []
    for claim in gen_claims:
        if not isinstance(claim, dict):
            errors.append("Generated claim is not an object")
            continue
        row = {field: str(claim.get(field, "")) for field in SOURCE_FIELDS}
        # Detect accidental loss of empty-string distinction.
        for field in SOURCE_FIELDS:
            if field not in claim:
                errors.append(f"Generated claim {claim.get('claim_id')} missing field {field}")
        gen_as_source.append(row)

        # Derived fields may exist but must not replace originals.
        for derived in DERIVED_FIELDS:
            if derived in claim and derived in SOURCE_FIELDS:
                errors.append(f"Derived field name collides with source field: {derived}")

    c1, m1, d1 = compare_records("published", pub_rows, "working_csv", work_rows, SOURCE_FIELDS)
    c2, m2, d2 = compare_records(
        "published", pub_rows, "generated_json", gen_as_source, SOURCE_FIELDS
    )

    print(f"Field comparisons published↔working_csv: {c1} (mismatches {m1})")
    print(f"Field comparisons published↔generated:   {c2} (mismatches {m2})")
    for detail in d1 + d2:
        print(f"  MISMATCH: {detail}")
        errors.append(detail)

    # Spot-check research-critical records without application helpers.
    by_pub = {r["claim_id"]: r for r in pub_rows}
    checks = {
        "ATLAS-HYP-004": {"status": "absence_of_finding"},
        "ATLAS-HYP-002": {
            "status": "unresolved_hypothesis",
            "admissible_in_policy_comparison": "no",
        },
        "ATLAS-HYP-003": {"primary_source_url": "", "status": "unresolved_hypothesis"},
        "ATLAS-CON-001": {"status": "contested_claim"},
        "ATLAS-EMP-002": {"status": "absence_of_finding"},
    }
    for claim_id, expect in checks.items():
        row = by_pub.get(claim_id)
        if row is None:
            errors.append(f"Missing critical claim {claim_id}")
            continue
        for field, value in expect.items():
            if row[field] != value:
                errors.append(
                    f"Critical check {claim_id}.{field}: got {row[field]!r}, expected {value!r}"
                )

    hyp002 = by_pub.get("ATLAS-HYP-002", {})
    leg003 = by_pub.get("ATLAS-LEG-003", {})
    if "\n" not in hyp002.get("admissibility_conditions", "") and len(
        hyp002.get("admissibility_conditions", "")
    ) < 40:
        # Not necessarily multiline; report lengths for audit evidence.
        pass
    print(
        f"ATLAS-HYP-002 admissibility_conditions length: "
        f"{len(hyp002.get('admissibility_conditions', ''))}"
    )
    print(
        f"ATLAS-LEG-003 limitations_external_validity length: "
        f"{len(leg003.get('limitations_external_validity', ''))}"
    )

    # Application-facing representation: generated claims must expose original fields.
    for claim in gen_claims:
        cid = claim.get("claim_id")
        for field in SOURCE_FIELDS:
            if claim.get(field) != by_pub[cid][field]:
                # Already counted above; keep loop for clarity.
                break

    total_comparisons = c1 + c2
    total_mismatches = m1 + m2
    print("---")
    print(f"Records compared (unique published IDs): {len(pub_ids)}")
    print(f"Original field value comparisons: {total_comparisons}")
    print(f"Mismatches: {total_mismatches}")
    print(f"Independent SHA-256 == reported provenance: {reported_sha == working_sha}")

    if errors:
        print("VERDICT: FAIL")
        for err in errors:
            print(f"  - {err}")
        return 1

    print("VERDICT: PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
