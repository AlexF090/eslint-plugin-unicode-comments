import { createFindingRule } from './create-finding-rule.ts';
import { selectCategories } from './allow-option.ts';

export const noPrivateUseOrUnassignedCharacters = createFindingRule({
  name: 'no-private-use-or-unassigned-characters',
  type: 'problem',
  description:
    'Disallow private-use characters, unassigned code points, noncharacters, and unpaired surrogates, whose rendering depends on fonts or tooling',
  messages: {
    privateUse:
      'Private-use character {{character}} in {{context}}. Its appearance depends on the installed fonts.',
    unassigned:
      'Unassigned code point or noncharacter {{character}} in {{context}}.',
    surrogate:
      'Unpaired surrogate {{character}} in {{context}}. The text is not well-formed Unicode.',
  },
  createSelector: selectCategories(['private-use', 'unassigned', 'surrogate']),
  messageId: (finding) => {
    if (finding.category === 'private-use') {
      return 'privateUse';
    }
    return finding.category === 'surrogate' ? 'surrogate' : 'unassigned';
  },
});
