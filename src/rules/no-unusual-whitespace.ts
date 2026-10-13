import {
  correctWithReplacement,
  SUGGEST_REPLACEMENT_MESSAGE_ID,
} from './correct-with-replacement.ts';
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
    [SUGGEST_REPLACEMENT_MESSAGE_ID]:
      'Replace with a regular space or line break (not applied automatically: outside the code of JavaScript and TypeScript it could change a value, rendered text, or markup, or turn a comment into a directive, and a line break could end a comment or a string).',
  },
  fixable: true,
  hasSuggestions: true,
  createSelector: selectCategories(['unusual-whitespace']),
  messageId: () => 'unusualWhitespace',
  correction: (finding, adapter) =>
    correctWithReplacement(finding, adapter, { fixesCode: true }),
});
