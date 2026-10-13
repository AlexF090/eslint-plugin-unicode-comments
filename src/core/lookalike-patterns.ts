/**
 * Patterns shared by the scanner and `scripts/generate-unicode-data.ts`, so
 * the generated lookalike data and the runtime filter cannot drift apart.
 */

/**
 * ASCII that a lookalike of no particular script must imitate and touch to
 * be reported: letters, digits, and the punctuation of URLs, paths, and
 * command-line options. Lookalikes of quotes, brackets, and operators are
 * left out: they are common in prose (modifier letter apostrophes, CJK
 * brackets) and cannot redirect a URL or change a command.
 */
export const asciiWordOrUrlCharacterPattern = /^[\w!#$%&*+\-./:=?@\\~]$/u;

/**
 * Characters never reported as lookalikes: other numbers, emoji, modifier
 * letters, superscripts and subscripts (`Na<U+207A>`, `2<U+207F>`), and
 * SCRIPT SMALL L (U+2113, the litre and the symbol for a length).
 */
export const lookalikeExclusionPattern =
  // eslint-disable-next-line regexp/no-dupe-characters-character-class -- the whole block of superscripts and subscripts is listed on purpose
  /^[\p{No}\p{Extended_Pictographic}\p{Lm}\u2070-\u209F\u2113]$/u;
