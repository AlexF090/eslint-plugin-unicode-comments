/**
 * Allow entries let users accept characters a rule would otherwise report.
 * Supported forms:
 *
 * - a single literal character: `"\u00E4"`
 * - one code point: `"U+00E4"`
 * - an inclusive code point range: `"U+0400..U+04FF"`
 * - a Unicode property escape: `"\\p{Script=Latin}"`, `"\\p{L}"`
 */

const codePointEntryPattern = /^U\+([0-9A-F]{4,6})$/iu;
const codePointRangeEntryPattern =
  /^U\+([0-9A-F]{4,6})\.\.U\+([0-9A-F]{4,6})$/iu;
const propertyEscapeEntryPattern = /^\\p\{[\w=]+\}$/u;
const negatedPropertyEscapeEntryPattern = /^\\P\{[\w=]+\}$/u;

const MAXIMUM_CODE_POINT = 0x10ffff;

export class InvalidAllowEntryError extends Error {
  constructor(entry: string, reason: string) {
    super(
      `Invalid allow entry ${JSON.stringify(entry)}: ${reason}. Use a single character, "U+XXXX", "U+XXXX..U+YYYY", or a Unicode property escape such as "\\p{Script=Latin}".`,
    );
    this.name = 'InvalidAllowEntryError';
  }
}

const parseHexCodePoint = (entry: string, hex: string): number => {
  const codePoint = Number.parseInt(hex, 16);
  if (codePoint > MAXIMUM_CODE_POINT) {
    throw new InvalidAllowEntryError(entry, 'code point is above U+10FFFF');
  }
  return codePoint;
};

const escapeCodePoint = (codePoint: number): string =>
  `\\u{${codePoint.toString(16)}}`;

const compilePropertyEscape = (entry: string): RegExp => {
  try {
    return new RegExp(`^${entry}$`, 'u');
  } catch {
    throw new InvalidAllowEntryError(
      entry,
      'unknown Unicode property or value',
    );
  }
};

/** Permanently unassigned (General_Category Cn in every Unicode version). */
const NONCHARACTER = '\uFFFF';
const LETTER = 'a';
const PRIVATE_USE_CHARACTER = '\uE000';

/**
 * Rejects property escapes that would allow (almost) every character, such
 * as `\p{Any}`, `\p{Cn}`, `\p{C}`, `\p{Script=Unknown}`, and `\p{Assigned}`,
 * by probing them with characters whose properties never change: a
 * property that matches a noncharacter covers the unassigned code points,
 * and the only properties that match both a letter and a private-use
 * character are `Any` and `Assigned`.
 */
const rejectMatchAllPropertyEscape = (entry: string, pattern: RegExp): void => {
  if (pattern.test(NONCHARACTER)) {
    throw new InvalidAllowEntryError(
      entry,
      'the property matches unassigned code points, so it would allow almost every character',
    );
  }
  if (pattern.test(LETTER) && pattern.test(PRIVATE_USE_CHARACTER)) {
    throw new InvalidAllowEntryError(
      entry,
      'the property matches every assigned character, so it would allow every dangerous character',
    );
  }
};

const toCharacterClassMember = (entry: string): string => {
  const rangeMatch = codePointRangeEntryPattern.exec(entry);
  if (rangeMatch?.[1] !== undefined && rangeMatch[2] !== undefined) {
    const first = parseHexCodePoint(entry, rangeMatch[1]);
    const last = parseHexCodePoint(entry, rangeMatch[2]);
    if (first > last) {
      throw new InvalidAllowEntryError(entry, 'range start is above range end');
    }
    return `${escapeCodePoint(first)}-${escapeCodePoint(last)}`;
  }

  const codePointMatch = codePointEntryPattern.exec(entry);
  if (codePointMatch?.[1] !== undefined) {
    return escapeCodePoint(parseHexCodePoint(entry, codePointMatch[1]));
  }

  if (negatedPropertyEscapeEntryPattern.test(entry)) {
    // `\P{L}` would silently allow almost every character.
    throw new InvalidAllowEntryError(
      entry,
      'negated property escapes are not supported',
    );
  }

  if (propertyEscapeEntryPattern.test(entry)) {
    rejectMatchAllPropertyEscape(entry, compilePropertyEscape(entry));
    return entry;
  }

  const characters = [...entry];
  const onlyCharacter = characters[0];
  if (characters.length === 1 && onlyCharacter !== undefined) {
    return escapeCodePoint(onlyCharacter.codePointAt(0) ?? 0);
  }

  throw new InvalidAllowEntryError(entry, 'unrecognized format');
};

export type CharacterPredicate = (character: string) => boolean;

const allowNothing: CharacterPredicate = () => false;

/** Compiles allow entries into one predicate; throws `InvalidAllowEntryError` for malformed entries. */
export const compileAllowList = (
  entries: readonly string[],
): CharacterPredicate => {
  if (entries.length === 0) {
    return allowNothing;
  }
  const pattern = new RegExp(
    `^[${entries.map(toCharacterClassMember).join('')}]$`,
    'u',
  );
  return (character) => pattern.test(character);
};
