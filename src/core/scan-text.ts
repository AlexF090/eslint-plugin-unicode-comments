import { asciiNeighborConfusables } from './ascii-neighbor-confusables.ts';
import { latinConfusables } from './latin-confusables.ts';
import {
  asciiWordOrUrlCharacterPattern,
  lookalikeExclusionPattern,
} from './lookalike-patterns.ts';
import { findMixedScriptCharacters } from './mixed-script.ts';
import type { SourceContext } from './source-context.ts';
import { typographicCharacters } from './typographic-replacements.ts';
import { findVettedOffsets } from './vetted-sequences.ts';

export const findingCategories = [
  'bidi-control',
  'invisible',
  'control',
  'private-use',
  'unassigned',
  'surrogate',
  'unusual-whitespace',
  'typographic',
  'lookalike',
  'mixed-script',
  'other',
] as const;

export type FindingCategory = (typeof findingCategories)[number];

export interface Finding {
  /** Offset of the first character in UTF-16 code units. */
  offset: number;
  /** Length in UTF-16 code units; covers `count` characters for grouped runs. */
  length: number;
  /** Code point of the first character. */
  codePoint: number;
  /** Number of characters in a run of identical-category characters. */
  count: number;
  category: FindingCategory;
  context: SourceContext;
  /** ASCII text that can replace the whole finding without changing meaning. */
  replacement?: string;
  /** For `lookalike`: the ASCII text (one to three characters) it imitates. */
  imitates?: string;
  /** For `mixed-script`: the script of the character and of its word. */
  script?: string;
  dominantScript?: string;
  /** For `invisible` runs of tag characters: the ASCII text they encode. */
  hiddenText?: string;
}

// A carriage return is only accepted as the first half of CRLF: alone, some
// viewers do not break the line while the language does.
const outsidePrintableAsciiPattern = /[^\t\n\r\x20-\x7E]|\r(?!\n)/u;
const scannedCharacterPattern = /[^\t\n\r\x20-\x7E]|\r(?!\n)/gu;
// Bounded so a single huge word cannot exhaust the regular expression stack;
// adjacent chunks are joined back into one word.
const wordChunkPattern = /[\p{L}\p{M}\p{Nd}\p{Pc}]{1,1024}/gu;
const nonAsciiPattern = /[\u0080-\u{10FFFF}]/u;

const bidiControlPattern = /^\p{Bidi_Control}$/u;
const controlPattern = /^\p{Cc}$/u;
const unusualWhitespacePattern = /^[\p{Zs}\u2028\u2029]$/u;
const invisiblePattern = /^[\p{Default_Ignorable_Code_Point}\p{Cf}]$/u;
// Characters outside the pattern above that render as nothing.
const blankCharacters: ReadonlySet<number> = new Set([
  0x2800, // BRAILLE PATTERN BLANK
  0x16fe4, // KHITAN SMALL SCRIPT FILLER
  0x1d159, // MUSICAL SYMBOL NULL NOTEHEAD
]);
const privateUsePattern = /^\p{Co}$/u;
const unassignedPattern = /^\p{Cn}$/u;
const imitatedAsciiCharacterPattern = /^[\x21-\x7E]$/u;
const imitatedAsciiLetterSequencePattern = /^[\x21-\x7E]{2,4}$/u;
const latinScriptPattern = /^\p{Script=Latin}$/u;

const LAST_LATIN_1_CODE_POINT = 0xff;
const FIRST_TAG_CHARACTER = 0xe0020;
const LAST_TAG_CHARACTER = 0xe007e;

const groupedCategories: ReadonlySet<FindingCategory> = new Set([
  'bidi-control',
  'invisible',
  'control',
  'private-use',
  'unassigned',
  'surrogate',
  'unusual-whitespace',
]);

const isSurrogate = (codePoint: number): boolean =>
  codePoint >= 0xd800 && codePoint <= 0xdfff;

/**
 * The ASCII text a non-ASCII character imitates: its NFKC normalization when
 * that is one printable ASCII character (fullwidth forms), or two to four
 * for a Latin character (the ligature U+FB01 for `fi`, the Roman numeral
 * U+2161 for `II`), or its UTS #39 confusable for Latin characters NFKC keeps.
 */
const findImitatedAscii = (
  character: string,
  codePoint: number,
): string | undefined => {
  if (
    codePoint <= LAST_LATIN_1_CODE_POINT ||
    lookalikeExclusionPattern.test(character)
  ) {
    return undefined;
  }
  const normalized = character.normalize('NFKC');
  if (imitatedAsciiCharacterPattern.test(normalized)) {
    return normalized;
  }
  // Latin ligatures, digraphs, and Roman numerals read as their letters; the
  // squared units and abbreviations of other scripts (U+338F for `kg`,
  // U+2116 for `No`) are ordinary symbols in their prose.
  if (
    imitatedAsciiLetterSequencePattern.test(normalized) &&
    latinScriptPattern.test(character)
  ) {
    return normalized;
  }
  return latinConfusables.get(codePoint);
};

type ClassifiedCharacter = Pick<
  Finding,
  'category' | 'replacement' | 'imitates'
>;

const whitespaceReplacement = (codePoint: number): string =>
  codePoint === 0x2028 || codePoint === 0x2029 ? '\n' : ' ';

export const classifyCharacter = (
  character: string,
  codePoint: number,
): ClassifiedCharacter => {
  if (isSurrogate(codePoint)) {
    return { category: 'surrogate' };
  }
  if (bidiControlPattern.test(character)) {
    return { category: 'bidi-control' };
  }
  if (controlPattern.test(character)) {
    return { category: 'control' };
  }
  if (unusualWhitespacePattern.test(character)) {
    return {
      category: 'unusual-whitespace',
      replacement: whitespaceReplacement(codePoint),
    };
  }
  if (invisiblePattern.test(character) || blankCharacters.has(codePoint)) {
    return { category: 'invisible' };
  }
  if (privateUsePattern.test(character)) {
    return { category: 'private-use' };
  }
  if (unassignedPattern.test(character)) {
    return { category: 'unassigned' };
  }
  const typographic = typographicCharacters.get(codePoint);
  if (typographic !== undefined) {
    return { category: 'typographic', replacement: typographic.replacement };
  }
  const imitates = findImitatedAscii(character, codePoint);
  if (imitates !== undefined) {
    return { category: 'lookalike', imitates };
  }
  return { category: 'other' };
};

const isTagCharacter = (codePoint: number): boolean =>
  codePoint >= FIRST_TAG_CHARACTER && codePoint <= LAST_TAG_CHARACTER;

const decodeTagCharacters = (run: string): string | undefined => {
  let decoded = '';
  for (const character of run) {
    const codePoint = character.codePointAt(0);
    if (codePoint !== undefined && isTagCharacter(codePoint)) {
      decoded += String.fromCodePoint(codePoint - 0xe0000);
    }
  }
  return decoded.length > 0 ? decoded : undefined;
};

const canGroup = (previous: Finding, next: Finding): boolean =>
  groupedCategories.has(next.category) &&
  previous.category === next.category &&
  previous.context === next.context &&
  previous.offset + previous.length === next.offset;

/**
 * Merges adjacent findings of the same invisible-type category and context
 * into one finding, so a hidden payload is reported once instead of once per
 * character, and decodes tag-character runs into `hiddenText`.
 */
export const groupFindings = (
  text: string,
  findings: readonly Finding[],
): Finding[] => {
  const grouped: Finding[] = [];
  for (const finding of findings) {
    const previous = grouped.at(-1);
    if (previous !== undefined && canGroup(previous, finding)) {
      previous.length += finding.length;
      previous.count += finding.count;
      if (
        previous.replacement !== undefined &&
        finding.replacement !== undefined
      ) {
        previous.replacement += finding.replacement;
      }
      continue;
    }
    grouped.push({ ...finding });
  }

  for (const finding of grouped) {
    if (finding.category !== 'invisible') {
      continue;
    }
    const hiddenText = decodeTagCharacters(
      text.slice(finding.offset, finding.offset + finding.length),
    );
    if (hiddenText !== undefined) {
      finding.hiddenText = hiddenText;
    }
  }
  return grouped;
};

const isAsciiNeighborLookalikeCandidate = (finding: Finding): boolean =>
  finding.category === 'other' &&
  asciiNeighborConfusables.has(finding.codePoint);

const touchesAsciiWordOrUrl = (
  text: string,
  run: readonly Finding[],
): boolean => {
  const first = run[0];
  const last = run.at(-1);
  if (first === undefined || last === undefined) {
    return false;
  }
  return (
    asciiWordOrUrlCharacterPattern.test(text.charAt(first.offset - 1)) ||
    asciiWordOrUrlCharacterPattern.test(text.charAt(last.offset + last.length))
  );
};

/**
 * Reports lookalikes of no particular script (DIVISION SLASH, MODIFIER
 * LETTER COLON, mathematical Greek letters, ...) only where they stand in
 * for ASCII: in a run of such characters that touches an ASCII letter,
 * digit, or URL character. Between spaces, as in `a <U+2215> b`, they are
 * ordinary symbols.
 */
const applyAsciiNeighborLookalikes = (
  text: string,
  findings: Iterable<Finding>,
): void => {
  const markRun = (run: readonly Finding[]): void => {
    if (!touchesAsciiWordOrUrl(text, run)) {
      return;
    }
    for (const finding of run) {
      const imitates = asciiNeighborConfusables.get(finding.codePoint);
      if (imitates === undefined) {
        continue;
      }
      finding.category = 'lookalike';
      finding.imitates = imitates;
    }
  };

  let run: Finding[] = [];
  for (const finding of findings) {
    if (!isAsciiNeighborLookalikeCandidate(finding)) {
      continue;
    }
    const previous = run.at(-1);
    if (
      previous !== undefined &&
      previous.offset + previous.length !== finding.offset
    ) {
      markRun(run);
      run = [];
    }
    run.push(finding);
  }
  markRun(run);
};

interface WordRange {
  start: number;
  end: number;
}

/** Word ranges, with the bounded chunks of `wordChunkPattern` that touch joined into one word. */
const findWordRanges = (text: string): WordRange[] => {
  const ranges: WordRange[] = [];
  for (const chunk of text.matchAll(wordChunkPattern)) {
    const end = chunk.index + chunk[0].length;
    const previous = ranges.at(-1);
    if (previous !== undefined && previous.end === chunk.index) {
      previous.end = end;
      continue;
    }
    ranges.push({ start: chunk.index, end });
  }
  return ranges;
};

const applyMixedScriptFindings = (
  text: string,
  findingsByOffset: Map<number, Finding>,
  resolveContext: (offset: number) => SourceContext,
): void => {
  for (const { start, end } of findWordRanges(text)) {
    const word = text.slice(start, end);
    if (!nonAsciiPattern.test(word)) {
      continue;
    }
    const result = findMixedScriptCharacters(word);
    if (result === undefined) {
      continue;
    }
    for (const foreign of result.foreignCharacters) {
      const offset = start + foreign.offset;
      const existing = findingsByOffset.get(offset);
      if (existing !== undefined && existing.category !== 'other') {
        continue;
      }
      findingsByOffset.set(offset, {
        offset,
        length: foreign.character.length,
        codePoint: foreign.character.codePointAt(0) ?? 0,
        count: 1,
        category: 'mixed-script',
        context: existing?.context ?? resolveContext(offset),
        script: foreign.script,
        dominantScript: result.dominantScript,
      });
    }
  }
};

/**
 * Scans `text` and returns one finding per character outside printable
 * ASCII (tab, line feed, and the carriage return of CRLF excepted), plus ASCII letters
 * that appear inside a mixed-script word, ordered by offset. Characters that
 * are part of a vetted sequence (see `findVettedOffsets`) produce no
 * finding. Use `groupFindings` to merge runs after filtering.
 */
export const scanText = (
  text: string,
  resolveContext: (offset: number) => SourceContext,
): Finding[] => {
  if (!outsidePrintableAsciiPattern.test(text)) {
    return [];
  }

  const vettedOffsets = findVettedOffsets(text, resolveContext);
  const findingsByOffset = new Map<number, Finding>();

  for (const match of text.matchAll(scannedCharacterPattern)) {
    const offset = match.index;
    if (vettedOffsets.has(offset)) {
      continue;
    }
    const character = match[0];
    const codePoint = character.codePointAt(0) ?? 0;
    const classified = classifyCharacter(character, codePoint);
    findingsByOffset.set(offset, {
      offset,
      length: character.length,
      codePoint,
      count: 1,
      context: resolveContext(offset),
      ...classified,
    });
  }

  applyAsciiNeighborLookalikes(text, findingsByOffset.values());
  applyMixedScriptFindings(text, findingsByOffset, resolveContext);

  return [...findingsByOffset.values()].sort(
    (left, right) => left.offset - right.offset,
  );
};
