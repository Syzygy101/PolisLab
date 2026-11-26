"""Check the exact v0.3 change inventory relative to production."""
import argparse
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
BASE = '8972f8dfdcf32e29655c8f9fdd51866d8a127ee2'
ADDED = {
    'docs/RETAIL_DEVELOPMENT_METHODS.md', 'docs/V03_DISCLOSURE.md',
    'src/components/retail-development/retail.ts', 'src/components/retail-development/strategic.ts',
    'src/components/retail-development/endogenous.ts', 'src/components/retail-development/experiment.ts',
    'src/pages/RetailDevelopmentPage.tsx', 'src/pages/retail-development.css',
    'scripts/replay-retail.ts', 'scripts/check-v03-disclosure.py',
    'tests/unit/retail-development.test.ts', 'tests/e2e/retail-development.spec.ts',
    'tests/fixtures/retail-1-reference.json',
}
MODIFIED = {
    'NOTICE', 'README.md', 'docs/RESEARCH_INVARIANTS.md', 'docs/ROUTE_INVENTORY.md', 'docs/MASTER_ROADMAP.md',
    'package.json', 'package-lock.json', 'src/components/layout/AppShell.tsx',
    'playwright.preview.config.ts', 'src/App.tsx', 'src/pages/OverviewPage.tsx',
    'tests/e2e/investigation-journeys.spec.ts', 'tests/unit/overview.test.tsx',
}
CHUNKS = {
    *[(name, 'js') for name in (
        'CaseDetailPage', 'CasebookMarkdown', 'CasebookPage', 'CasebookSourcePage',
        'ClaimDetailPage', 'ComparePage', 'ComparisonPage', 'GapRequirementPage', 'GapsPage',
        'MechanismDetailPage', 'MechanismPathway', 'MechanismsPage', 'RetailDevelopmentPage', 'SourceRefList',
        'casebookConstants', 'casebookDataset', 'casebookQueries', 'gapsParse', 'index',
        'mechanismQueries', 'taxonomy', 'urlFilters', 'useDocumentTitle')],
    ('RetailDevelopmentPage', 'css'), ('index', 'css'),
}
LOCAL_PATH = re.compile(rb'/(?:Users|private/tmp|home)/[A-Za-z0-9_.-]+')
SECRET = re.compile(rb'-----BEGIN (?:[A-Z ]+ )?PRIVATE KEY-----|gh[pousr]_[A-Za-z0-9]{30,}|AKIA[A-Z0-9]{16}')


def git(*args):
    return subprocess.check_output(['git', *args], cwd=ROOT).decode().split('\0')


def require(condition, message):
    if not condition:
        raise SystemExit(message)


def verify(built):
    rows = git('diff', '--name-status', '-z', '--no-renames', BASE)
    by_status = {status: set(rows[i+1] for i in range(0,len(rows)-1,2) if rows[i]==status)
                 for status in ('A','M')}
    untracked = set(git('ls-files', '--others', '--exclude-standard', '-z')) - {''}
    require(set(rows[:-1:2]) <= {'A','M'}, 'Unexpected Git change type')
    require(by_status['A'] | untracked == ADDED, f"Unexpected additions: {(by_status['A'] | untracked) ^ ADDED}")
    require(by_status['M'] == MODIFIED, f"Unexpected modifications: {by_status['M'] ^ MODIFIED}")
    for rel in ADDED | MODIFIED:
        require((ROOT/rel).is_file() and not (ROOT/rel).is_symlink(), f'Unexpected source type at {rel}')
        if rel != 'scripts/check-v03-disclosure.py':
            content = (ROOT/rel).read_bytes()
            require(not LOCAL_PATH.search(content) and not SECRET.search(content), f'Sensitive token at {rel}')
    if built:
        dist = ROOT / 'dist'
        paths = {file.relative_to(dist).as_posix() for file in dist.rglob('*') if file.is_file()}
        require({'index.html','_headers'} <= paths, 'Missing index or headers')
        chunks = set()
        for rel in sorted(paths - {'index.html','_headers'}):
            match = re.fullmatch(r'assets/(.+)-[A-Za-z0-9_-]{8}\.(js|css)',rel)
            require(match and match.groups() in CHUNKS and match.groups() not in chunks,
                    f'Unexpected output {rel}')
            chunks.add(match.groups())
            content = (dist/rel).read_bytes()
            require(not LOCAL_PATH.search(content) and not SECRET.search(content), f'Sensitive asset token in {rel}')
        require(chunks == CHUNKS, f'Missing output roles: {CHUNKS-chunks}')
    print(f'v0.3 disclosure matches {len(ADDED)} additions, {len(MODIFIED)} modifications'
          + (f' and {len(paths)} distribution files' if built else ''))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--built', action='store_true')
    verify(parser.parse_args().built)
