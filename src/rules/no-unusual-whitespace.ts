import { correctWithReplacement } from './correct-with-replacement.ts';
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
    suggestReplacement:
      'Replace with a regular space or line break (not applied automatically: it can change a string value or rendered text).',
  },
  fixable: true,
  createSelector: selectCategories(['unusual-whitespace']),
  messageId: () => 'unusualWhitespace',
  correction: (finding, adapter) =>
    correctWithReplacement(finding, adapter, { fixesCode: true }),
});
