import { isInertRemoval } from './correct-with-replacement.ts';
import { createFindingRule } from './create-finding-rule.ts';
import { selectCategories } from './allow-option.ts';

export const noBidiControl = createFindingRule({
  name: 'no-bidi-control',
  type: 'problem',
  description:
    'Disallow bidirectional control characters, which make source code display in a different order than it is executed (Trojan Source, CVE-2021-42574)',
  messages: {
    bidiControl:
      'Bidirectional control character {{character}} in {{context}}. It can reorder how the surrounding code is displayed (Trojan Source).',
    suggestRemoval: 'Remove {{character}}.',
  },
  hasSuggestions: true,
  createSelector: selectCategories(['bidi-control']),
  messageId: () => 'bidiControl',
  correction: (finding, _adapter, sourceText) =>
    isInertRemoval(sourceText, finding.offset, finding.length)
      ? { kind: 'suggestion', text: '', messageId: 'suggestRemoval' }
      : undefined,
});
