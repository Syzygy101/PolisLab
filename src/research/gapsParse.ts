/**
 * Parse numbered research-requirement items from a casebook §9 markdown body.
 * Independent of the curated registry — used for integrity verification.
 */

export interface ParsedSection9Item {
  itemNumber: number;
  /** Exact text after "N. ", including trailing hard-break spaces when present. */
  sourceText: string;
}

/**
 * Extract numbered list items from a §9 section markdown string.
 * Expects items of the form `1. …` at the start of a line.
 */
export function parseSection9Items(sectionMarkdown: string): ParsedSection9Item[] {
  const items: ParsedSection9Item[] = [];
  const re = /^(\d+)\.\s+(.*(?:\n(?!\d+\.\s).*)*)/gm;
  let match: RegExpExecArray | null;
  while ((match = re.exec(sectionMarkdown)) !== null) {
    const itemNumber = Number(match[1]);
    // Preserve trailing spaces on the final line; strip only the trailing newline.
    const sourceText = match[2].replace(/\n$/, '');
    items.push({ itemNumber, sourceText });
  }
  return items;
}

/** Right-trim for display / soft comparison; does not alter the stored source. */
export function displayRequirementText(sourceText: string): string {
  return sourceText.replace(/[ \t]+$/gm, '').trimEnd();
}

/** Soft equality: ignore trailing whitespace differences only. */
export function sourceTextsMatch(a: string, b: string): boolean {
  return a.replace(/[ \t]+$/gm, '').trimEnd() === b.replace(/[ \t]+$/gm, '').trimEnd();
}
