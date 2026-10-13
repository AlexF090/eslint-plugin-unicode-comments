import type { SourceContext } from './source-context.ts';
import { isProseContext } from './source-context.ts';

/**
 * Finds offsets of format characters and selectors that are part of a
 * legitimate sequence and therefore must not be reported as invisible:
 *
 * - ZERO WIDTH JOINER inside emoji ZWJ sequences
 * - VARIATION SELECTOR-15/16 after an emoji (text or emoji presentation)
 * - variation selectors after a CJK ideograph (standardized and ideographic
 *   variation sequences)
 * - tag characters of the three RGI subdivision flags (England, Scotland,
 *   Wales)
 * - ZERO WIDTH JOINER/NON-JOINER between letters of scripts that use them
 *   for correct shaping (Arabic, Indic, ...)
 *
 * Sequences are only vetted in comments, strings, and prose. A variation
 * selector directly after another variation selector is never vetted: one
 * base character takes at most one selector, and long selector runs are how
 * payloads are hidden in otherwise empty-looking text.
 */

const ZERO_WIDTH_JOINER = 0x200d;
const ZERO_WIDTH_NON_JOINER = 0x200c;
const TEXT_PRESENTATION_SELECTOR = 0xfe0e;
const EMOJI_PRESENTATION_SELECTOR = 0xfe0f;

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

const emojiPattern = /^\p{Emoji}$/u;
const pictographicPattern = /^\p{Extended_Pictographic}$/u;
const emojiModifierPattern = /^\p{Emoji_Modifier}$/u;
const ideographicPattern = /^\p{Ideographic}$/u;
const letterPattern = /^[\p{L}\p{M}]$/u;
const joiningScriptPattern = new RegExp(
  '^[' +
    joiningScripts
      .map((script) => String.raw`\p{Script_Extensions=` + script + '}')
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

const isJoiningScriptLetter = (character: string | undefined): boolean =>
  matches(letterPattern, character) && matches(joiningScriptPattern, character);

const isVettedJoiner = (
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
    return true;
  }
  return (
    (codePoint === ZERO_WIDTH_JOINER || codePoint === ZERO_WIDTH_NON_JOINER) &&
    isJoiningScriptLetter(previous) &&
    isJoiningScriptLetter(next)
  );
};

const isVettedVariationSelector = (
  codePoint: number,
  previous: string | undefined,
): boolean => {
  const previousCodePoint = previous?.codePointAt(0);
  if (
    previous === undefined ||
    previousCodePoint === undefined ||
    isVariationSelector(previousCodePoint)
  ) {
    return false;
  }
  if (
    codePoint === TEXT_PRESENTATION_SELECTOR ||
    codePoint === EMOJI_PRESENTATION_SELECTOR
  ) {
    return emojiPattern.test(previous);
  }
  return ideographicPattern.test(previous);
};

export const findVettedOffsets = (
  text: string,
  resolveContext: (offset: number) => SourceContext,
): Set<number> => {
  const vettedOffsets = new Set<number>();

  for (const match of text.matchAll(subdivisionFlagPattern)) {
    if (!isProseContext(resolveContext(match.index))) {
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
    if (codePoint === undefined || !isProseContext(resolveContext(offset))) {
      continue;
    }
    const previous = characterBefore(text, offset);
    const vetted = isVariationSelector(codePoint)
      ? isVettedVariationSelector(codePoint, previous)
      : isVettedJoiner(
          codePoint,
          previous,
          characterAt(text, offset + match[0].length),
        );
    if (vetted) {
      vettedOffsets.add(offset);
    }
  }

  return vettedOffsets;
};
