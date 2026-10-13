import {
  correctWithReplacement,
  SUGGEST_REPLACEMENT_MESSAGE_ID,
} from './correct-with-replacement.ts';
import { createFindingRule } from './create-finding-rule.ts';
import { selectCategories } from './allow-option.ts';

export const noTypographicCharacters = createFindingRule({
  name: 'no-typographic-characters',
  type: 'suggestion',
  description:
    'Disallow typographic characters (dashes, curly quotes, ellipsis, bullets, arrows) that word processors and language models insert where a developer types ASCII',
  messages: {
    typographic:
      'Typographic character {{character}} in {{context}}. Use "{{replacement}}" instead.',
    [SUGGEST_REPLACEMENT_MESSAGE_ID]: 'Replace with "{{replacement}}".',
  },
  hasSuggestions: true,
  createSelector: selectCategories(['typographic']),
  messageId: () => 'typographic',
  correction: (finding, adapter) =>
    correctWithReplacement(finding, adapter, { fixesCode: false }),
});
