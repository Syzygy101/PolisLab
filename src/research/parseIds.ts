import { ID_FIELD_DELIMITER } from './constants';

/**
 * Split semicolon-delimited identifier fields while preserving the original string elsewhere.
 * Empty / whitespace-only source values yield an empty parsed list.
 */
export function parseSemicolonIds(raw: string): string[] {
  if (raw.trim() === '') {
    return [];
  }
  return raw
    .split(ID_FIELD_DELIMITER)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}
