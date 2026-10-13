import type { Finding } from '../core/scan-text.ts';
import type { SourceContext } from '../core/source-context.ts';
import type { LanguageAdapter } from '../languages/language-adapter.ts';
import type { Correction } from './create-finding-rule.ts';

export const SUGGEST_REPLACEMENT_MESSAGE_ID = 'suggestReplacement';

interface CorrectionOptions {
  /** Whether the rule corrects findings in code at all (fixed or suggested). */
  fixesCode: boolean;
}

const lineBreakPattern = /[\n\r]/u;

/**
 * ASCII characters that end or open syntax in each context: comment
 * terminators (an asterisk before a slash, `-->`), string delimiters, escapes, and template
 * interpolation, and the markup openers of HTML, JSX, and Markdown text.
 * Even a suggestion that inserts one of them could turn the rest of a
 * comment, string, or text into live code or markup once applied.
 */
const syntaxCharacterPatterns: Partial<Record<SourceContext, RegExp>> = {
  comment: /[*/>]/u,
  string: /[$"'\\`{}]/u,
  text: /[<>&{}[\]`]/u,
};

/** Whether `text` may replace a character in `context` without inserting syntax. */
export const isInertReplacement = (
  context: SourceContext,
  text: string,
): boolean => syntaxCharacterPatterns[context]?.test(text) !== true;

/**
 * Corrects a finding with its ASCII replacement. A fix is applied
 * automatically only where it provably keeps the meaning: unusual
 * whitespace between the tokens of a language whose adapter fixes code
 * (JavaScript and TypeScript treat that whitespace as a separator already),
 * when the rule sets `fixesCode`. Everywhere else the replacement is only
 * suggested, because tools and renderers read comments, strings, and prose:
 * a fixed dash can turn a comment into an `eslint-disable` directive, and a
 * fixed quote or space in Markdown can complete inline HTML, a link, or front
 * matter. Identifiers are never touched.
 *
 * A replacement that inserts a line break is only ever suggested, because in
 * code it could end a comment or a string.
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
      return isInertReplacement(finding.context, replacement)
        ? suggestion
        : undefined;
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
