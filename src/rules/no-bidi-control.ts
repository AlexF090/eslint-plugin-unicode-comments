import { createFindingRule } from './create-finding-rule.ts';
import {
  allowOptionSchema,
  defaultAllowOptions,
  selectCategories,
  type AllowRuleOptions,
} from './allow-option.ts';

export const noBidiControl = createFindingRule<AllowRuleOptions>({
  name: 'no-bidi-control',
  type: 'problem',
  description:
    'Disallow bidirectional control characters, which make source code display in a different order than it is executed (Trojan Source, CVE-2021-42574)',
  messages: {
    bidiControl:
      'Bidirectional control character {{character}} in {{context}}. It can reorder how the surrounding code is displayed (Trojan Source).',
    suggestRemoval: 'Remove {{character}}.',
  },
  schema: allowOptionSchema,
  defaultOptions: defaultAllowOptions,
  createSelector: selectCategories(['bidi-control']),
  messageId: () => 'bidiControl',
  correction: () => ({
    kind: 'suggestion',
    text: '',
    messageId: 'suggestRemoval',
  }),
});
