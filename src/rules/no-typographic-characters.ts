import { createFindingRule } from './create-finding-rule.ts';
import {
  allowOptionSchema,
  defaultAllowOptions,
  selectCategories,
} from './allow-option.ts';

export const noTypographicCharacters = createFindingRule({
  name: 'no-typographic-characters',
  type: 'suggestion',
  description:
    'Disallow typographic characters (dashes, curly quotes, ellipsis, bullets, arrows) that word processors and language models insert where a developer types ASCII',
  messages: {
    typographic:
      'Typographic character {{character}} in {{context}}. Use "{{replacement}}" instead.',
    suggestReplacement:
      'Replace with "{{replacement}}" (changes the string value).',
  },
  fixable: true,
  schema: allowOptionSchema,
  defaultOptions: defaultAllowOptions,
  createSelector: selectCategories(['typographic']),
  messageId: () => 'typographic',
  correction: (finding) => {
    if (finding.replacement === undefined) {
      return undefined;
    }
    if (finding.context === 'comment' || finding.context === 'text') {
      return { kind: 'fix', text: finding.replacement };
    }
    return finding.context === 'string'
      ? {
          kind: 'suggestion',
          text: finding.replacement,
          messageId: 'suggestReplacement',
        }
      : undefined;
  },
});
