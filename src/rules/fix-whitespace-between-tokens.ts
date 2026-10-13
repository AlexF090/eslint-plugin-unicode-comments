import type { Finding } from '../core/scan-text.ts';
import type { LanguageAdapter } from '../languages/language-adapter.ts';

const lineBreakPattern = /[\n\r]/u;

/**
 * The text that replaces unusual whitespace automatically: only between the
 * tokens of a language whose adapter fixes code (JavaScript and TypeScript
 * already treat that whitespace as a separator, so a space keeps the
 * meaning), and never a line break, which could end a comment or a string.
 *
 * No other finding is corrected, not even as a suggestion: any replacement
 * or removal can create syntax once applied. A dash before `>` ends an HTML
 * comment, a comma splits a YAML list, and even letters form directives
 * (`eslint-disable`), tag names (`<script>`), keywords, and YAML booleans.
 */
export const fixWhitespaceBetweenTokens = (
  finding: Finding,
  adapter: LanguageAdapter,
): string | undefined => {
  const { replacement } = finding;
  if (
    replacement === undefined ||
    finding.context !== 'code' ||
    adapter.fixesCode !== true ||
    lineBreakPattern.test(replacement)
  ) {
    return undefined;
  }
  return replacement;
};
