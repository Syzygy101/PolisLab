#!/usr/bin/env python3
"""
Independent Build 04 casebook fidelity verifier.

Uses only Python's standard library. Does NOT import application parsers.
Checks published casebook Markdown structure, substantive section text,
atlas membership sets, and generated casebook SHA / membership against
independent expectations.

Newline handling for content comparison: CR and CRLF are normalised to LF
only so line-oriented splitting matches the application's structural parse.
The provenance SHA is always over raw file bytes (no newline rewrite).
"""

from __future__ import annotations

import csv
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLISHED_COMMIT = "a1922f8a8d08f59749d34de306e1b7406f9fe10b"
CASEBOOK_REL = "research/10_policy_assessment_casebook.md"
ATLAS_REL = "research/10_policy_claims_atlas.csv"
GENERATED_REL = "src/data/casebook.generated.json"

EXPECTED_TITLES = {
    "Case1": "Undeveloped supermarket sites",
    "Case2": "Foreign greenfield grocery investment",
    "Case3": "Differentiated entry and scale-up",
    "Case4": "Supermarket acquisition oversight",
}

EXPECTED_MEMBERSHIP = {
    "Case1": {
        "ATLAS-ADM-002",
        "ATLAS-ASM-001",
        "ATLAS-ASM-002",
        "ATLAS-CON-003",
        "ATLAS-EMP-001",
        "ATLAS-EMP-002",
        "ATLAS-EMP-003",
        "ATLAS-GAP-001",
        "ATLAS-GAP-004",
        "ATLAS-HYP-001",
        "ATLAS-HYP-002",
        "ATLAS-LEG-003",
        "ATLAS-LEG-006",
        "ATLAS-LEG-007",
        "ATLAS-LIT-003",
        "ATLAS-LIT-004",
        "ATLAS-LIT-006",
        "ATLAS-POL-001",
        "ATLAS-POL-002",
        "ATLAS-POL-004",
    },
    "Case2": {
        "ATLAS-ADM-001",
        "ATLAS-ASM-001",
        "ATLAS-ASM-002",
        "ATLAS-CON-001",
        "ATLAS-CON-002",
        "ATLAS-CON-003",
        "ATLAS-EMP-003",
        "ATLAS-GAP-002",
        "ATLAS-HYP-003",
        "ATLAS-LEG-001",
        "ATLAS-LEG-002",
        "ATLAS-LEG-003",
        "ATLAS-LEG-004",
        "ATLAS-LEG-005",
        "ATLAS-LEG-006",
        "ATLAS-LIT-005",
        "ATLAS-POL-003",
    },
    "Case3": {
        "ATLAS-ASM-001",
        "ATLAS-ASM-002",
        "ATLAS-CON-003",
        "ATLAS-EMP-003",
        "ATLAS-EMP-004",
        "ATLAS-EMP-005",
        "ATLAS-EMP-006",
        "ATLAS-GAP-002",
        "ATLAS-HYP-004",
        "ATLAS-LEG-009",
        "ATLAS-LIT-001",
        "ATLAS-LIT-002",
        "ATLAS-LIT-005",
        "ATLAS-PILOT-001",
    },
    "Case4": {
        "ATLAS-ADM-002",
        "ATLAS-ADM-003",
        "ATLAS-ASM-001",
        "ATLAS-ASM-002",
        "ATLAS-CON-003",
        "ATLAS-EMP-007",
        "ATLAS-GAP-002",
        "ATLAS-GAP-003",
        "ATLAS-LEG-005",
        "ATLAS-LEG-006",
        "ATLAS-LEG-007",
        "ATLAS-LEG-008",
    },
}

# Substantive anchors drawn from the published Markdown (not the app parser).
SUBSTANTIVE_ANCHORS: list[tuple[str, int, str]] = [
    ("Case1", 1, "Develop-or-release"),
    ("Case1", 1, "Exclusivity restriction"),
    ("Case1", 2, "40% cap is Layer D only"),
    ("Case1", 3, "That released sites go to rivals"),
    ("Case1", 6, "R (develop-or-release)"),
    ("Case1", 6, "E (exclusivity restriction)"),
    ("Case1", 6, "Destroys efficient **option value**"),
    ("Case1", 6, "Landlord willingness to support development falls"),
    ("Case1", 6, "Sites were never commercially viable for rivals"),
    ("Case1", 10, "neither R nor E can be ranked as a welfare-improving reform"),
    ("Case2", 2, "**T1** Start Australian grocery business"),
    ("Case2", 2, "**FGI contrast**"),
    ("Case2", 2, "60–240 month"),
    ("Case2", 3, "**CF-A**"),
    ("Case2", 3, "**CF-B**"),
    ("Case2", 3, "**CF-C**"),
    ("Case2", 3, "**CF-D**"),
    ("Case2", 3, "Turn off FIRB for all foreign grocery entry"),
    ("Case2", 8, "binding entitlements"),
    ("Case3", 2, "pre-2026"),
    ("Case3", 5, "Regency Park (SA) DC"),
    ("Case3", 5, "**29** SA, **41** WA, **526** nationally"),
    ("Case3", 7, "**Yes — best-supported:**"),
    ("Case3", 10, "strong O2 scale-up benchmark and a weak O5/O6 guide"),
    ("Case4", 2, "Substantive “cleared as pro-competitive”"),
    ("Case4", 2, "voluntarily notified"),
    ("Case4", 5, "27 November 2025"),
    ("Case4", 5, "**not** final disposition of the ACCC refusal"),
    ("Case4", 10, "competition scoreboard"),
]

FRONT_MATTER_ANCHORS = [
    "How to use this casebook",
    "**Layer A**",
    "**Layer D**",
    "ATLAS-ASM-002",
    "ATLAS-CON-003",
    "Access ≠ capacity ≠ viability ≠ survival ≠ durable constraint ≠ welfare",
    "Phase 0D.2 toy-game propositions",
]

COMPARISON_ANCHORS = [
    "Four-case comparison table",
    "Policy winner?",
    "None declared",
    "Kalgoorlie was voluntary notify",
]


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def git_show_bytes(rel: str) -> bytes:
    result = subprocess.run(
        ["git", "show", f"{PUBLISHED_COMMIT}:{rel}"],
        cwd=ROOT,
        check=True,
        capture_output=True,
    )
    return result.stdout


def for_lines(text: str) -> str:
    """LF-only view for line splitting. Does not alter non-newline characters."""
    return text.replace("\r\n", "\n").replace("\r", "\n")


def split_cases(text: str) -> dict[str, dict]:
    """Independent structural extract of cases and numbered sections."""
    lines = for_lines(text).split("\n")
    case_re = re.compile(r"^## Case ([1-4]) — (.+)$")
    section_re = re.compile(r"^### (\d+)\.\s+(.+)$")
    starts: list[tuple[int, int, str]] = []
    for i, line in enumerate(lines):
        m = case_re.match(line)
        if m:
            starts.append((i, int(m.group(1)), m.group(2).strip()))

    cases: dict[str, dict] = {}
    for idx, (start, num, title) in enumerate(starts):
        end = starts[idx + 1][0] if idx + 1 < len(starts) else len(lines)
        if idx == len(starts) - 1:
            for j in range(start + 1, len(lines)):
                if lines[j].startswith("## ") and not case_re.match(lines[j]):
                    end = j
                    break
        block = lines[start:end]
        while block and block[-1].strip() in ("", "---"):
            block.pop()
        body = block[1:]
        section_starts: list[tuple[int, int, str]] = []
        for i, line in enumerate(body):
            sm = section_re.match(line)
            if sm:
                section_starts.append((i, int(sm.group(1)), sm.group(2).strip()))
        sections: dict[int, str] = {}
        for s_i, (s_start, s_num, _title) in enumerate(section_starts):
            s_end = (
                section_starts[s_i + 1][0]
                if s_i + 1 < len(section_starts)
                else len(body)
            )
            sec_lines = body[s_start + 1 : s_end]
            while sec_lines and sec_lines[-1].strip() in ("", "---"):
                sec_lines.pop()
            while sec_lines and sec_lines[0].strip() == "":
                sec_lines.pop(0)
            md = "\n".join(sec_lines)
            if md:
                md += "\n"
            sections[s_num] = md
        case_id = f"Case{num}"
        cases[case_id] = {"title": title, "sections": sections}
    return cases


def extract_front_matter(text: str) -> str:
    lines = for_lines(text).split("\n")
    for i, line in enumerate(lines):
        if re.match(r"^## Case [1-4] — ", line):
            return "\n".join(lines[:i])
    return for_lines(text)


def extract_closing(text: str) -> str:
    lines = for_lines(text).split("\n")
    case_re = re.compile(r"^## Case [1-4] — ")
    last_case = max((i for i, line in enumerate(lines) if case_re.match(line)), default=-1)
    if last_case < 0:
        return ""
    for j in range(last_case + 1, len(lines)):
        if lines[j].startswith("## ") and not case_re.match(lines[j]):
            return "\n".join(lines[j:])
    return ""


def main() -> int:
    issues: list[str] = []
    casebook_path = ROOT / CASEBOOK_REL
    atlas_path = ROOT / ATLAS_REL
    generated_path = ROOT / GENERATED_REL

    working_bytes = casebook_path.read_bytes()
    published_bytes = git_show_bytes(CASEBOOK_REL)
    if working_bytes != published_bytes:
        issues.append("Working-tree casebook differs from published commit a1922f8")

    checksum = sha256_bytes(working_bytes)
    print(f"Casebook SHA-256: {checksum}")

    working = working_bytes.decode("utf-8")
    independent_cases = split_cases(working)
    front = extract_front_matter(working)
    closing = extract_closing(working)

    if len(independent_cases) != 4:
        issues.append(f"Expected 4 cases in independent split, found {len(independent_cases)}")

    for case_id, title in EXPECTED_TITLES.items():
        got = independent_cases.get(case_id, {}).get("title")
        if got != title:
            issues.append(f"{case_id} title mismatch: {got!r} != {title!r}")
        sections = independent_cases.get(case_id, {}).get("sections", {})
        if len(sections) != 10:
            issues.append(f"{case_id}: expected 10 sections, found {len(sections)}")

    total_sections = sum(len(c.get("sections", {})) for c in independent_cases.values())
    if total_sections != 40:
        issues.append(f"Expected 40 sections total, found {total_sections}")

    for case_id, sec, needle in SUBSTANTIVE_ANCHORS:
        md = independent_cases.get(case_id, {}).get("sections", {}).get(sec, "")
        if needle not in md:
            issues.append(
                f"Independent extract missing substantive text {case_id} §{sec}: {needle!r}"
            )

    for needle in FRONT_MATTER_ANCHORS:
        if needle not in front:
            issues.append(f"Front matter missing substantive text: {needle!r}")

    for needle in COMPARISON_ANCHORS:
        if needle not in closing:
            issues.append(f"Closing material missing substantive text: {needle!r}")

    atlas_membership: dict[str, set[str]] = {k: set() for k in EXPECTED_MEMBERSHIP}
    with atlas_path.open(newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        for row in reader:
            for case_id in (row.get("casebook_cases") or "").split(";"):
                case_id = case_id.strip()
                if case_id in atlas_membership:
                    atlas_membership[case_id].add(row["claim_id"])

    for case_id, expected in EXPECTED_MEMBERSHIP.items():
        actual = atlas_membership[case_id]
        if actual != expected:
            issues.append(
                f"{case_id} atlas membership mismatch; "
                f"missing={sorted(expected - actual)}; extra={sorted(actual - expected)}"
            )

    if not generated_path.exists():
        issues.append(f"Missing {GENERATED_REL}")
    else:
        generated = json.loads(generated_path.read_text(encoding="utf-8"))
        if generated.get("provenance", {}).get("sourceContentSha256") != checksum:
            issues.append("Generated casebook SHA drifts from source Markdown")
        gen_cases = {c["id"]: c for c in generated.get("cases", [])}
        for case_id, expected in EXPECTED_MEMBERSHIP.items():
            case = gen_cases.get(case_id)
            if not case:
                issues.append(f"Generated casebook missing {case_id}")
                continue
            mem = set(case.get("membershipClaimIds", []))
            if mem != expected:
                issues.append(f"{case_id} generated membership mismatch")
            if len(case.get("sections", [])) != 10:
                issues.append(f"{case_id} does not have 10 sections in generated data")
            # Exact section-body fidelity vs independent extract (LF view).
            for section in case.get("sections", []):
                num = section["number"]
                indep = independent_cases[case_id]["sections"].get(num, "")
                gen_md = section.get("markdown", "")
                if for_lines(gen_md) != for_lines(indep):
                    issues.append(
                        f"{case_id} §{num}: generated markdown differs from independent extract"
                    )
                # Spot-check table cells / emphasis survive without whitespace collapse.
                if num == 6 and case_id == "Case1":
                    if "| **Favourable** |" not in gen_md or "| **Null** |" not in gen_md:
                        issues.append(f"{case_id} §6 pathway table markers missing in generated")

        for case_id, sec, needle in SUBSTANTIVE_ANCHORS:
            case = gen_cases.get(case_id)
            if not case:
                continue
            section = next((s for s in case["sections"] if s["number"] == sec), None)
            if section is None or needle not in section["markdown"]:
                issues.append(
                    f"Generated data missing substantive text {case_id} §{sec}: {needle!r}"
                )

        gen_front = generated.get("frontMatterMarkdown", "")
        for needle in FRONT_MATTER_ANCHORS:
            if needle not in gen_front:
                issues.append(f"Generated front matter missing: {needle!r}")

        closing_blob = "\n".join(p.get("markdown", "") for p in generated.get("closingParts", []))
        for needle in COMPARISON_ANCHORS:
            if needle not in closing_blob and needle not in "\n".join(
                p.get("title", "") for p in generated.get("closingParts", [])
            ):
                # Title may hold the heading without repeating in body after strip.
                if needle == "Four-case comparison table":
                    titles = [p.get("title", "") for p in generated.get("closingParts", [])]
                    if not any("comparison" in t.lower() for t in titles):
                        issues.append(f"Generated closing missing: {needle!r}")
                elif needle not in closing_blob:
                    issues.append(f"Generated closing missing: {needle!r}")

    for path in (ROOT / "src" / "data").glob("0[1-9]_*"):
        issues.append(f"Unpublished research copy under src/data: {path.name}")

    if issues:
        print("Independent casebook verification FAILED")
        for issue in issues:
            print(f"  - {issue}")
        return 1

    print("Independent casebook verification passed")
    print("  cases: 4")
    print("  sections: 40")
    print("  substantive anchors: checked against independent extract + generated")
    print("  membership sets: exact match for Case1–Case4")
    print(f"  published commit: {PUBLISHED_COMMIT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
