import type { SourceContext } from './source-context.ts';
import { acceptsVettedSequences } from './source-context.ts';
import { standardizedVariationSequences } from './standardized-variation-sequences.ts';

/**
 * Finds offsets of format characters and selectors that are part of a
 * legitimate sequence and therefore must not be reported as invisible:
 *
 * - ZERO WIDTH JOINER inside emoji ZWJ sequences, at most three per
 *   sequence (the longest RGI sequences have three)
 * - VARIATION SELECTOR-15/16 after a pictographic emoji, and VARIATION
 *   SELECTOR-16 in a keycap sequence (digit, `#`, or `*`, then U+20E3)
 * - VARIATION SELECTOR-1 to -14 where StandardizedVariants.txt defines
 *   the sequence for the base character (CJK compatibility variants, math
 *   symbols, Myanmar, ...)
 * - tag characters of the three RGI subdivision flags (England, Scotland,
 *   Wales)
 * - ZERO WIDTH JOINER/NON-JOINER after a letter of a script that uses them
 *   for correct shaping (Arabic, Indic, ...), possibly followed by its
 *   marks, and before a letter or mark of such a script. Script, not
 *   Script_Extensions, decides: marks shared with Latin do not count.
 *
 * Sequences are only vetted in comments, strings, and prose. A variation
 * selector directly after another variation selector is never vetted: one
 * base character takes at most one selector, and long selector runs are how
 * payloads are hidden in otherwise empty-looking text. Ideographic variation
 * selectors (VS17 to VS256) are never vetted: each one can carry a byte
 * after any ideograph, and the Ideographic Variation Database that would
 * tell legitimate sequences apart is not bundled.
 */

const ZERO_WIDTH_JOINER = 0x200d;
const ZERO_WIDTH_NON_JOINER = 0x200c;
const TEXT_PRESENTATION_SELECTOR = 0xfe0e;
const EMOJI_PRESENTATION_SELECTOR = 0xfe0f;
const COMBINING_ENCLOSING_KEYCAP = 0x20e3;
const MAXIMUM_EMOJI_JOINERS = 3;
// Unicode Stream-Safe Text Format: at most 30 combining marks in a row.
const MAXIMUM_COMBINING_MARKS = 30;

const joiningScripts = [
  'Arabic',
  'Syriac',
  'Nko',
  'Mongolian',
  'Devanagari',
  'Bengali',
  'Gurmukhi',
  'Gujarati',
  'Oriya',
  'Tamil',
  'Telugu',
  'Kannada',
  'Malayalam',
  'Sinhala',
  'Khmer',
  'Myanmar',
  'Tibetan',
];

const keycapBasePattern = /^[\d#*]$/u;
const pictographicPattern = /^\p{Extended_Pictographic}$/u;
const emojiModifierPattern = /^\p{Emoji_Modifier}$/u;
const letterPattern = /^\p{L}$/u;
const markPattern = /^\p{M}$/u;
const letterOrMarkPattern = /^[\p{L}\p{M}]$/u;
const joiningScriptPattern = new RegExp(
  '^[' +
    joiningScripts
      .map((script) => String.raw`\p{Script=` + script + '}')
      .join('') +
    ']$',
  'u',
);
const joinerOrSelectorPattern =
  // eslint-disable-next-line regexp/prefer-character-class -- a class containing U+200D trips no-misleading-character-class
  /\u200C|\u200D|[\uFE00-\uFE0F\u{E0100}-\u{E01EF}]/gu;
const subdivisionFlagPattern =
  /\u{1F3F4}\u{E0067}\u{E0062}(?:\u{E0065}\u{E006E}\u{E0067}|\u{E0073}\u{E0063}\u{E0074}|\u{E0077}\u{E006C}\u{E0073})\u{E007F}/gu;

const isVariationSelector = (codePoint: number): boolean =>
  (codePoint >= 0xfe00 && codePoint <= 0xfe0f) ||
  (codePoint >= 0xe0100 && codePoint <= 0xe01ef);

const isStandardizedVariationSelector = (codePoint: number): boolean =>
  codePoint >= 0xfe00 && codePoint < TEXT_PRESENTATION_SELECTOR;

const isHighSurrogate = (codeUnit: number): boolean =>
  codeUnit >= 0xd800 && codeUnit <= 0xdbff;

const isLowSurrogate = (codeUnit: number): boolean =>
  codeUnit >= 0xdc00 && codeUnit <= 0xdfff;

const characterBefore = (text: string, offset: number): string | undefined => {
  if (offset <= 0) {
    return undefined;
  }
  if (
    offset >= 2 &&
    isLowSurrogate(text.charCodeAt(offset - 1)) &&
    isHighSurrogate(text.charCodeAt(offset - 2))
  ) {
    return text.slice(offset - 2, offset);
  }
  return text.charAt(offset - 1);
};

const characterAt = (text: string, offset: number): string | undefined => {
  const codePoint = text.codePointAt(offset);
  return codePoint === undefined ? undefined : String.fromCodePoint(codePoint);
};

const matches = (pattern: RegExp, character: string | undefined): boolean =>
  character !== undefined && pattern.test(character);

const isJoiningScriptCharacter = (character: string | undefined): boolean =>
  matches(letterOrMarkPattern, character) &&
  matches(joiningScriptPattern, character);

/**
 * The base letter the marks before `offset` attach to. Marks are skipped
 * because many of them (U+0951 DEVANAGARI STRESS SIGN UDATTA, Arabic vowel
 * marks) can follow a Latin letter as well; only the base tells the script.
 * Gives up after the stream-safe limit of combining marks.
 */
const baseCharacterBefore = (
  text: string,
  offset: number,
): string | undefined => {
  let cursor = offset;
  for (let marks = 0; marks <= MAXIMUM_COMBINING_MARKS; marks += 1) {
    const previous = characterBefore(text, cursor);
    if (!matches(markPattern, previous)) {
      return previous;
    }
    cursor -= previous?.length ?? 0;
  }
  return undefined;
};

const emojiSequencePartPattern =
  /^[\p{Extended_Pictographic}\p{Emoji_Modifier}\uFE0F]$/u;

/**
 * Counts the emoji joiners before `offset` in the same emoji sequence. Stops
 * once the count exceeds the limit, so the work per joiner stays bounded.
 */
const countPrecedingEmojiJoiners = (text: string, offset: number): number => {
  let joiners = 0;
  let cursor = offset;
  while (joiners <= MAXIMUM_EMOJI_JOINERS) {
    const previous = characterBefore(text, cursor);
    if (previous === undefined) {
      break;
    }
    if (previous === String.fromCodePoint(ZERO_WIDTH_JOINER)) {
      joiners += 1;
    } else if (!emojiSequencePartPattern.test(previous)) {
      break;
    }
    cursor -= previous.length;
  }
  return joiners;
};

const isVettedJoiner = (
  text: string,
  offset: number,
  codePoint: number,
  previous: string | undefined,
  next: string | undefined,
): boolean => {
  const joinsEmoji =
    codePoint === ZERO_WIDTH_JOINER &&
    matches(pictographicPattern, next) &&
    (matches(pictographicPattern, previous) ||
      matches(emojiModifierPattern, previous) ||
      previous === String.fromCodePoint(EMOJI_PRESENTATION_SELECTOR));
  if (joinsEmoji) {
    return countPrecedingEmojiJoiners(text, offset) < MAXIMUM_EMOJI_JOINERS;
  }
  if (codePoint !== ZERO_WIDTH_JOINER && codePoint !== ZERO_WIDTH_NON_JOINER) {
    return false;
  }
  const base = baseCharacterBefore(text, offset);
  return (
    matches(letterPattern, base) &&
    isJoiningScriptCharacter(base) &&
    isJoiningScriptCharacter(next)
  );
};

const isVettedVariationSelector = (
  codePoint: number,
  previous: string | undefined,
  next: string | undefined,
): boolean => {
  const previousCodePoint = previous?.codePointAt(0);
  if (
    previous === undefined ||
    previousCodePoint === undefined ||
    isVariationSelector(previousCodePoint)
  ) {
    return false;
  }
  if (isStandardizedVariationSelector(codePoint)) {
    return (
      standardizedVariationSequences
        .get(previousCodePoint)
        ?.includes(codePoint) === true
    );
  }
  if (
    codePoint === TEXT_PRESENTATION_SELECTOR ||
    codePoint === EMOJI_PRESENTATION_SELECTOR
  ) {
    const startsKeycap =
      codePoint === EMOJI_PRESENTATION_SELECTOR &&
      keycapBasePattern.test(previous) &&
      next === String.fromCodePoint(COMBINING_ENCLOSING_KEYCAP);
    return startsKeycap || pictographicPattern.test(previous);
  }
  return false;
};

export const findVettedOffsets = (
  text: string,
  resolveContext: (offset: number) => SourceContext,
): Set<number> => {
  const vettedOffsets = new Set<number>();

  for (const match of text.matchAll(subdivisionFlagPattern)) {
    if (!acceptsVettedSequences(resolveContext(match.index))) {
      continue;
    }
    const BLACK_FLAG_LENGTH = 2;
    const TAG_CHARACTER_LENGTH = 2;
    for (
      let offset = match.index + BLACK_FLAG_LENGTH;
      offset < match.index + match[0].length;
      offset += TAG_CHARACTER_LENGTH
    ) {
      vettedOffsets.add(offset);
    }
  }

  for (const match of text.matchAll(joinerOrSelectorPattern)) {
    const offset = match.index;
    const codePoint = match[0].codePointAt(0);
    if (
      codePoint === undefined ||
      !acceptsVettedSequences(resolveContext(offset))
    ) {
      continue;
    }
    const previous = characterBefore(text, offset);
    const next = characterAt(text, offset + match[0].length);
    const vetted = isVariationSelector(codePoint)
      ? isVettedVariationSelector(codePoint, previous, next)
      : isVettedJoiner(text, offset, codePoint, previous, next);
    if (vetted) {
      vettedOffsets.add(offset);
    }
  }

  return vettedOffsets;
};
