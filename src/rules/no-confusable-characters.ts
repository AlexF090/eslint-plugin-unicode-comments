import { createFindingRule } from './create-finding-rule.ts';
import { selectCategories } from './allow-option.ts';

export const noConfusableCharacters = createFindingRule({
  name: 'no-confusable-characters',
  type: 'problem',
  description:
    'Disallow characters that imitate ASCII (fullwidth forms, mathematical alphanumerics) and words that mix scripts (homograph attacks)',
  messages: {
    lookalike:
      '{{character}} in {{context}} imitates the ASCII text `{{imitates}}`.',
    mixedScript:
      '{{script}} character {{character}} in a {{dominantScript}} word in {{context}}. Mixing scripts within one word is the shape of a homograph attack.',
  },
  createSelector: selectCategories(['lookalike', 'mixed-script']),
  messageId: (finding) =>
    finding.category === 'lookalike' ? 'lookalike' : 'mixedScript',
});
