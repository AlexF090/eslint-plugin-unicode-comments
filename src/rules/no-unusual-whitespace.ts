import { fixWhitespaceBetweenTokens } from './fix-whitespace-between-tokens.ts';
import { createFindingRule } from './create-finding-rule.ts';
import { selectCategories } from './allow-option.ts';

export const noUnusualWhitespace = createFindingRule({
  name: 'no-unusual-whitespace',
  type: 'problem',
  description:
    'Disallow whitespace other than space, tab, and line breaks (no-break, thin, ideographic spaces, line and paragraph separators)',
  messages: {
    unusualWhitespace:
      'Unusual whitespace {{character}} in {{context}}. Use a regular space or line break.',
  },
  fixable: true,
  createSelector: selectCategories(['unusual-whitespace']),
  messageId: () => 'unusualWhitespace',
  fix: fixWhitespaceBetweenTokens,
});
