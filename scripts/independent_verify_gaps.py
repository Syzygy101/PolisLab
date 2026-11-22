#!/usr/bin/env python3
"""
Independent Build 07 Evidence Gaps verifier.

Uses only Python's standard library. Does NOT import application parsers.
Verifies:
  - 19 numbered §9 research requirements in the pinned casebook Markdown
  - Per-case counts Case1=5, Case2=5, Case3=4, Case4=5
  - Exact source wording of each registry entry against Markdown §9 items
  - No omitted / duplicated / silently merged registry IDs
  - GAP / absence_of_finding / unresolved_hypothesis atlas counts
  - ATLAS-HYP-004 remains absence_of_finding
  - ATLAS-HYP-002 remains unresolved_hypothesis with admissibility=no
  - Original research artefacts unchanged vs published commit
"""

from __future__ import annotations

import csv
import hashlib
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLISHED_COMMIT = "a1922f8a8d08f59749d34de306e1b7406f9fe10b"
CASEBOOK_REL = "research/10_policy_assessment_casebook.md"
ATLAS_REL = "research/10_policy_claims_atlas.csv"
REGISTRY_REL = "src/research/gapsRequirements.ts"

EXPECTED_SECTION9_COUNTS = {
    "Case1": 5,
    "Case2": 5,
    "Case3": 4,
    "Case4": 5,
}
EXPECTED_TOTAL = 19

# Anchor phrases that must appear in the corresponding registry sourceText
# (content checks, not mere counts).
EXPECTED_CONTENT_ANCHORS = {
    "REQ-C1-01": "exclusionary intent",
    "REQ-C1-02": "non-incumbents with subsequent openings",
    "REQ-C1-03": "planning delay vs holding vs exclusivity",
    "REQ-C1-04": "developed",
    "REQ-C1-05": "lawful, administrable release regime",
    "REQ-C2-01": "FIRB processing distributions",
    "REQ-C2-02": "ordinary private grocery starts",
    "REQ-C2-03": "marginal cause of abandonment",
    "REQ-C2-04": "greenfield vs acquisition",
    "REQ-C2-05": "Federal Register",
    "REQ-C3-01": "revenue",
    "REQ-C3-02": "announced-vs-opened",
    "REQ-C3-03": "ATLAS-GAP-002",
    "REQ-C3-04": "weaken H1",
    "REQ-C4-01": "ACT 1 of 2026",
    "REQ-C4-02": "notified/waiver sites",
    "REQ-C4-03": "site preemption",
    "REQ-C4-04": "covenant/exclusivity",
    "REQ-C4-05": "2030 sunset",
}


def sha256_file(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def git_show(rel: str) -> bytes:
    return subprocess.check_output(
        ["git", "show", f"{PUBLISHED_COMMIT}:{rel}"],
        cwd=ROOT,
    )


def normalize_source(text: str) -> str:
    """Soft compare: ignore trailing horizontal whitespace per line."""
    return "\n".join(line.rstrip(" \t") for line in text.split("\n")).rstrip()


def parse_section9_items(body: str) -> list[tuple[int, str]]:
    items: list[tuple[int, str]] = []
    for match in re.finditer(
        r"^(\d+)\.\s+(.*(?:\n(?!\d+\.\s).*)*)", body, flags=re.M
    ):
        num = int(match.group(1))
        text = match.group(2).rstrip("\n")
        items.append((num, text))
    return items


def extract_case_section9(md: str) -> dict[str, list[tuple[int, str]]]:
    out: dict[str, list[tuple[int, str]]] = {}
    cases = re.split(r"(?=^## Case \d)", md, flags=re.M)
    for block in cases:
        m = re.match(r"^## Case (\d)", block)
        if not m:
            continue
        case_id = f"Case{m.group(1)}"
        sm = re.search(
            r"^### 9\.[^\n]*\n(.*?)(?=^### |\Z|^## )",
            block,
            flags=re.S | re.M,
        )
        if not sm:
            out[case_id] = []
            continue
        out[case_id] = parse_section9_items(sm.group(1))
    return out


def parse_registry_source_texts(ts: str) -> list[tuple[str, str, int, str]]:
    """Return (id, caseId, itemNumber, sourceText) from gapsRequirements.ts."""
    pairs: list[tuple[str, str, int, str]] = []
    for m in re.finditer(
        r"id:\s*'(REQ-C([1-4])-(\d{2}))'[\s\S]*?sourceText:\s*'((?:\\'|[^'])*)'",
        ts,
    ):
        rid = m.group(1)
        case_id = f"Case{m.group(2)}"
        item_number = int(m.group(3))
        source_text = m.group(4)
        pairs.append((rid, case_id, item_number, source_text))
    return pairs


def main() -> int:
    issues: list[str] = []

    casebook_path = ROOT / CASEBOOK_REL
    atlas_path = ROOT / ATLAS_REL
    registry_path = ROOT / REGISTRY_REL

    # Pin check (published research only)
    for rel, path in [(CASEBOOK_REL, casebook_path), (ATLAS_REL, atlas_path)]:
        published = git_show(rel)
        if path.read_bytes() != published:
            issues.append(f"Drift vs {PUBLISHED_COMMIT}:{rel}")

    if not registry_path.is_file():
        issues.append(f"Missing registry {REGISTRY_REL}")
        print("FAIL")
        for issue in issues:
            print(f"  - {issue}")
        return 1

    md = casebook_path.read_text(encoding="utf-8")
    section9 = extract_case_section9(md)
    total = 0
    for case_id, expected in EXPECTED_SECTION9_COUNTS.items():
        items = section9.get(case_id, [])
        total += len(items)
        if len(items) != expected:
            issues.append(
                f"{case_id} §9 count {len(items)} != expected {expected}"
            )
        for i, (num, text) in enumerate(items, start=1):
            if num != i:
                issues.append(f"{case_id} §9 item numbering gap at {num}")
            if not text.strip():
                issues.append(f"{case_id} §9 item {num} empty")

    if total != EXPECTED_TOTAL:
        issues.append(f"Total §9 items {total} != {EXPECTED_TOTAL}")

    # Registry content vs Markdown (actual wording, not counts alone)
    registry_ts = registry_path.read_text(encoding="utf-8")
    pairs = parse_registry_source_texts(registry_ts)
    if len(pairs) != EXPECTED_TOTAL:
        issues.append(f"Registry sourceText entries {len(pairs)} != {EXPECTED_TOTAL}")
    seen_ids: set[str] = set()
    for rid, case_id, item_number, source_text in pairs:
        if rid in seen_ids:
            issues.append(f"Duplicate registry id {rid}")
        seen_ids.add(rid)
        expected_id = f"REQ-C{case_id[-1]}-{item_number:02d}"
        if rid != expected_id:
            issues.append(f"ID/case/item mismatch: {rid} vs {expected_id}")
        items = section9.get(case_id, [])
        match = next((t for n, t in items if n == item_number), None)
        if match is None:
            issues.append(f"{rid}: no Markdown §9.{item_number} in {case_id}")
            continue
        if normalize_source(source_text) != normalize_source(match):
            issues.append(
                f"{rid}: sourceText drift vs Markdown\n"
                f"    registry={source_text!r}\n"
                f"    markdown={match!r}"
            )
        anchor = EXPECTED_CONTENT_ANCHORS.get(rid)
        if anchor and anchor.lower() not in source_text.lower():
            issues.append(f"{rid}: missing content anchor {anchor!r}")

    missing_ids = set(EXPECTED_CONTENT_ANCHORS) - seen_ids
    if missing_ids:
        issues.append(f"Registry omitted IDs: {sorted(missing_ids)}")

    # Case3 item 3 must cite ATLAS-GAP-002 in both Markdown and registry
    c3 = section9.get("Case3", [])
    if len(c3) >= 3 and "ATLAS-GAP-002" not in c3[2][1]:
        issues.append("Case3 §9.3 Markdown must cite ATLAS-GAP-002")

    # Atlas classification
    with atlas_path.open(newline="", encoding="utf-8") as fh:
        rows = list(csv.DictReader(fh))

    gap_prefixed = [r for r in rows if r["claim_id"].startswith("ATLAS-GAP-")]
    absence = [r for r in rows if r["status"] == "absence_of_finding"]
    unresolved = [r for r in rows if r["status"] == "unresolved_hypothesis"]
    with_obs = [
        r
        for r in rows
        if r.get("observation_that_would_alter_assessment", "").strip()
    ]

    if len(gap_prefixed) != 4:
        issues.append(f"GAP-prefixed count {len(gap_prefixed)} != 4")
    if len(absence) != 6:
        issues.append(f"absence_of_finding count {len(absence)} != 6")
    if len(unresolved) != 4:
        issues.append(f"unresolved_hypothesis count {len(unresolved)} != 4")
    if len(with_obs) != len(rows):
        issues.append(
            f"observation_that_would_alter_assessment filled for "
            f"{len(with_obs)}/{len(rows)} claims"
        )

    hyp004 = next((r for r in rows if r["claim_id"] == "ATLAS-HYP-004"), None)
    if not hyp004 or hyp004["status"] != "absence_of_finding":
        issues.append("ATLAS-HYP-004 must retain absence_of_finding")

    hyp002 = next((r for r in rows if r["claim_id"] == "ATLAS-HYP-002"), None)
    if (
        not hyp002
        or hyp002["status"] != "unresolved_hypothesis"
        or hyp002["admissible_in_policy_comparison"] != "no"
    ):
        issues.append(
            "ATLAS-HYP-002 must remain unresolved_hypothesis with admissibility=no"
        )

    # Stale-registry regression: ensure Case1 §9.3 wording is present verbatim-soft
    c1_03 = next((t for n, t in section9.get("Case1", []) if n == 3), "")
    if "quasi-experiment" not in c1_03:
        issues.append("Case1 §9.3 Markdown missing quasi-experiment phrasing")

    print("independent_verify_gaps")
    print(f"  casebook_sha256={sha256_file(casebook_path)}")
    print(f"  section9_total={total}")
    for case_id, expected in EXPECTED_SECTION9_COUNTS.items():
        print(f"  {case_id}={len(section9.get(case_id, []))} (expected {expected})")
    print(f"  registry_entries={len(pairs)}")
    print(f"  gap_prefixed={len(gap_prefixed)}")
    print(f"  absence_of_finding={len(absence)}")
    print(f"  unresolved_hypothesis={len(unresolved)}")
    print(f"  claims_with_observation={len(with_obs)}")

    if issues:
        print("FAIL")
        for issue in issues:
            print(f"  - {issue}")
        return 1

    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
