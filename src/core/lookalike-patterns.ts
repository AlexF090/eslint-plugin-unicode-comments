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

/** Characters never reported as lookalikes: other numbers and emoji. */
export const lookalikeExclusionPattern = /^[\p{No}\p{Extended_Pictographic}]$/u;
