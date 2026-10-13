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
  },
  createSelector: selectCategories(['typographic']),
  messageId: () => 'typographic',
});
