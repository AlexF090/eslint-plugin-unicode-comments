import { typographicCharacters } from './typographic-replacements.ts';

/**
 * Names for the code points this plugin reports most often. Unicode names
 * are not available from the JavaScript engine, and shipping the full
 * UnicodeData table would cost about 2 MB, so less common code points fall
 * back to their `U+XXXX` notation.
 */
const characterNames = new Map<number, string>([
  // Bidirectional controls
  [0x061c, 'ARABIC LETTER MARK'],
  [0x200e, 'LEFT-TO-RIGHT MARK'],
  [0x200f, 'RIGHT-TO-LEFT MARK'],
  [0x202a, 'LEFT-TO-RIGHT EMBEDDING'],
  [0x202b, 'RIGHT-TO-LEFT EMBEDDING'],
  [0x202c, 'POP DIRECTIONAL FORMATTING'],
  [0x202d, 'LEFT-TO-RIGHT OVERRIDE'],
  [0x202e, 'RIGHT-TO-LEFT OVERRIDE'],
  [0x2066, 'LEFT-TO-RIGHT ISOLATE'],
  [0x2067, 'RIGHT-TO-LEFT ISOLATE'],
  [0x2068, 'FIRST STRONG ISOLATE'],
  [0x2069, 'POP DIRECTIONAL ISOLATE'],

  // Invisible and format characters
  [0x00ad, 'SOFT HYPHEN'],
  [0x034f, 'COMBINING GRAPHEME JOINER'],
  [0x115f, 'HANGUL CHOSEONG FILLER'],
  [0x1160, 'HANGUL JUNGSEONG FILLER'],
  [0x17b4, 'KHMER VOWEL INHERENT AQ'],
  [0x17b5, 'KHMER VOWEL INHERENT AA'],
  [0x180e, 'MONGOLIAN VOWEL SEPARATOR'],
  [0x200b, 'ZERO WIDTH SPACE'],
  [0x200c, 'ZERO WIDTH NON-JOINER'],
  [0x200d, 'ZERO WIDTH JOINER'],
  [0x2060, 'WORD JOINER'],
  [0x2061, 'FUNCTION APPLICATION'],
  [0x2062, 'INVISIBLE TIMES'],
  [0x2063, 'INVISIBLE SEPARATOR'],
  [0x2064, 'INVISIBLE PLUS'],
  [0x2800, 'BRAILLE PATTERN BLANK'],
  [0x3164, 'HANGUL FILLER'],
  [0xfeff, 'ZERO WIDTH NO-BREAK SPACE'],
  [0xffa0, 'HALFWIDTH HANGUL FILLER'],
  [0xfff9, 'INTERLINEAR ANNOTATION ANCHOR'],
  [0xfffa, 'INTERLINEAR ANNOTATION SEPARATOR'],
  [0xfffb, 'INTERLINEAR ANNOTATION TERMINATOR'],
  [0xe0001, 'LANGUAGE TAG'],
  [0xe007f, 'CANCEL TAG'],

  // Control characters
  [0x0000, 'NULL'],
  [0x0007, 'BELL'],
  [0x0008, 'BACKSPACE'],
  [0x000b, 'LINE TABULATION'],
  [0x000c, 'FORM FEED'],
  [0x001b, 'ESCAPE'],
  [0x007f, 'DELETE'],
  [0x0085, 'NEXT LINE'],

  // Whitespace
  [0x00a0, 'NO-BREAK SPACE'],
  [0x1680, 'OGHAM SPACE MARK'],
  [0x2000, 'EN QUAD'],
  [0x2001, 'EM QUAD'],
  [0x2002, 'EN SPACE'],
  [0x2003, 'EM SPACE'],
  [0x2004, 'THREE-PER-EM SPACE'],
  [0x2005, 'FOUR-PER-EM SPACE'],
  [0x2006, 'SIX-PER-EM SPACE'],
  [0x2007, 'FIGURE SPACE'],
  [0x2008, 'PUNCTUATION SPACE'],
  [0x2009, 'THIN SPACE'],
  [0x200a, 'HAIR SPACE'],
  [0x2028, 'LINE SEPARATOR'],
  [0x2029, 'PARAGRAPH SEPARATOR'],
  [0x202f, 'NARROW NO-BREAK SPACE'],
  [0x205f, 'MEDIUM MATHEMATICAL SPACE'],
  [0x3000, 'IDEOGRAPHIC SPACE'],
]);

const describeGeneratedName = (codePoint: number): string | undefined => {
  if (codePoint >= 0xfe00 && codePoint <= 0xfe0f) {
    return `VARIATION SELECTOR-${codePoint - 0xfe00 + 1}`;
  }
  if (codePoint >= 0xe0100 && codePoint <= 0xe01ef) {
    return `VARIATION SELECTOR-${codePoint - 0xe0100 + 17}`;
  }
  if (codePoint >= 0xe0020 && codePoint <= 0xe007e) {
    return `TAG CHARACTER for '${String.fromCodePoint(codePoint - 0xe0000)}'`;
  }
  return undefined;
};

export const formatCodePoint = (codePoint: number): string =>
  `U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}`;

export const getCharacterName = (codePoint: number): string | undefined =>
  characterNames.get(codePoint) ??
  typographicCharacters.get(codePoint)?.name ??
  describeGeneratedName(codePoint);

/** `U+200B ZERO WIDTH SPACE`, or just `U+XXXX` for unnamed code points. */
export const describeCodePoint = (codePoint: number): string => {
  const name = getCharacterName(codePoint);
  return name === undefined
    ? formatCodePoint(codePoint)
    : `${formatCodePoint(codePoint)} ${name}`;
};
