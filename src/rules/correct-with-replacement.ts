import type { Finding } from '../core/scan-text.ts';
import type { LanguageAdapter } from '../languages/language-adapter.ts';
import type { Correction } from './create-finding-rule.ts';

export const SUGGEST_REPLACEMENT_MESSAGE_ID = 'suggestReplacement';

interface CorrectionOptions {
  /** Whether the rule corrects findings in code at all (fixed or suggested). */
  fixesCode: boolean;
}

const lineBreakPattern = /[\n\r]/u;

const lettersAndDigitsPattern = /^[\dA-Za-z]+$/u;
const letterDigitOrSpacePattern = /^[\dA-Za-z\t ]$/u;

/**
 * Whether a suggestion may insert `text`. Only ASCII letters and digits are
 * inert in every supported language; any punctuation, space, or line break
 * can end a comment or string, split an attribute, or open markup once the
 * suggestion is applied (`-` before `>` ends an HTML comment, `,` splits a
 * YAML flow list, `(` completes a Markdown link).
 */
export const isInertReplacement = (text: string): boolean =>
  lettersAndDigitsPattern.test(text);

/**
 * Whether removing `[offset, offset + length)` from `sourceText` joins two
 * characters that cannot form syntax together: letters, digits, spaces, tabs,
 * or the start or end of the text. Removing an invisible character between
 * `$` and `{` would otherwise open a template interpolation.
 */
export const isInertRemoval = (
  sourceText: string,
  offset: number,
  length: number,
): boolean => {
  const before = sourceText.charAt(offset - 1);
  const after = sourceText.charAt(offset + length);
  return (
    (before === '' || letterDigitOrSpacePattern.test(before)) &&
    (after === '' || letterDigitOrSpacePattern.test(after))
  );
};

/**
 * Corrects a finding with its ASCII replacement. A fix is applied
 * automatically only where it provably keeps the meaning: unusual
 * whitespace between the tokens of a language whose adapter fixes code
 * (JavaScript and TypeScript treat that whitespace as a separator already),
 * when the rule sets `fixesCode`. Everywhere else the replacement is only
 * suggested, and only when it consists of ASCII letters and digits (see
 * `isInertReplacement`); dashes, quotes, spaces, and other punctuation get no
 * suggestion, because applying one could turn a comment, string, or text into
 * live code or markup. Identifiers are never touched.
 */
export const correctWithReplacement = (
  finding: Finding,
  adapter: LanguageAdapter,
  { fixesCode }: CorrectionOptions,
): Correction => {
  const { replacement } = finding;
  if (replacement === undefined) {
    return undefined;
  }
  const suggestion: Correction = {
    kind: 'suggestion',
    text: replacement,
    messageId: SUGGEST_REPLACEMENT_MESSAGE_ID,
  };
  switch (finding.context) {
    case 'comment':
    case 'string':
    case 'text':
      return isInertReplacement(replacement) ? suggestion : undefined;
    case 'code':
      if (!fixesCode) {
        return undefined;
      }
      return adapter.fixesCode === true && !lineBreakPattern.test(replacement)
        ? { kind: 'fix', text: replacement }
        : suggestion;
    case 'identifier':
      return undefined;
  }
};
