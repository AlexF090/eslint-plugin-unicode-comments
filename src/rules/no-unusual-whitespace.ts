import { createFindingRule } from './create-finding-rule.ts';
import {
  allowOptionSchema,
  defaultAllowOptions,
  selectCategories,
} from './allow-option.ts';

export const noUnusualWhitespace = createFindingRule({
  name: 'no-unusual-whitespace',
  type: 'problem',
  description:
    'Disallow whitespace other than space, tab, and line breaks (no-break, thin, ideographic spaces, line and paragraph separators)',
  messages: {
    unusualWhitespace:
      'Unusual whitespace {{character}} in {{context}}. Use a regular space or line break.',
    suggestReplacement:
      'Replace with a regular space or line break (changes the string value).',
  },
  fixable: true,
  schema: allowOptionSchema,
  defaultOptions: defaultAllowOptions,
  createSelector: selectCategories(['unusual-whitespace']),
  messageId: () => 'unusualWhitespace',
  correction: (finding) => {
    if (finding.replacement === undefined) {
      return undefined;
    }
    return finding.context === 'string'
      ? {
          kind: 'suggestion',
          text: finding.replacement,
          messageId: 'suggestReplacement',
        }
      : { kind: 'fix', text: finding.replacement };
  },
});
