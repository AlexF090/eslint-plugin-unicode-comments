import { createFindingRule } from './create-finding-rule.ts';
import { selectCategories } from './allow-option.ts';

export const noInvisibleCharacters = createFindingRule({
  name: 'no-invisible-characters',
  type: 'problem',
  description:
    'Disallow invisible characters (zero-width characters, Hangul fillers, tag characters, stray variation selectors, control characters) that can hide code or instructions from reviewers',
  messages: {
    invisible:
      'Invisible character {{character}} in {{context}}. Invisible characters can hide code or instructions from reviewers.',
    hiddenText:
      'Invisible tag characters in {{context}} encode the hidden text "{{hiddenText}}" (ASCII smuggling).',
    control: 'Control character {{character}} in {{context}}.',
    suggestRemoval: 'Remove {{character}}.',
  },
  hasSuggestions: true,
  createSelector: selectCategories(['invisible', 'control']),
  messageId: (finding) => {
    if (finding.category === 'control') {
      return 'control';
    }
    return finding.hiddenText === undefined ? 'invisible' : 'hiddenText';
  },
  correction: () => ({
    kind: 'suggestion',
    text: '',
    messageId: 'suggestRemoval',
  }),
});
