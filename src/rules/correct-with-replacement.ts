import type { Finding } from '../core/scan-text.ts';
import type { LanguageAdapter } from '../languages/language-adapter.ts';
import type { Correction } from './create-finding-rule.ts';

export const SUGGEST_REPLACEMENT_MESSAGE_ID = 'suggestReplacement';

const lineBreakPattern = /[\n\r]/u;

/**
 * Corrects a finding with its ASCII replacement where that is safe: fixed
 * in comments and prose, suggested in strings and rendered or unstructured
 * text (a fix there could change a value or break embedded code), fixed in
 * code only when `fixesCode` is set, and never touched in identifiers.
 *
 * A replacement that inserts a line break is only ever suggested: in YAML,
 * TOML, and JSON with comments a line break ends a comment, so fixing a line
 * separator would turn the rest of the comment into live configuration, and
 * in Markdown it could start a new block.
 */
export const correctWithReplacement = (
  finding: Finding,
  adapter: LanguageAdapter,
  { fixesCode }: { fixesCode: boolean },
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
  const fix: Correction = lineBreakPattern.test(replacement)
    ? suggestion
    : { kind: 'fix', text: replacement };
  switch (finding.context) {
    case 'comment':
      return fix;
    case 'text':
      return adapter.fixesText === true ? fix : suggestion;
    case 'string':
      return suggestion;
    case 'code':
      return fixesCode ? fix : undefined;
    case 'identifier':
      return undefined;
  }
};
