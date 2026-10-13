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
      'Replace with a regular space or line break (not applied automatically: it could change a value or rendered text, or end a comment early).',
  },
  fixable: true,
  hasSuggestions: true,
  createSelector: selectCategories(['unusual-whitespace']),
  messageId: () => 'unusualWhitespace',
  correction: (finding, environment) =>
    correctWithReplacement(finding, environment, { fixesCode: true }),
});
