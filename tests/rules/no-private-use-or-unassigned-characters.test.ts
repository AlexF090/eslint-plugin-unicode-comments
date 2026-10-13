import { noPrivateUseOrUnassignedCharacters } from '../../src/rules/no-private-use-or-unassigned-characters.ts';
import { ruleTester } from '../rule-tester.ts';

ruleTester.run(
  'no-private-use-or-unassigned-characters',
  noPrivateUseOrUnassignedCharacters,
  {
    valid: [
      'const icon = "\\uE0A0";',
      {
        code: 'const icon = "\uE0A0";',
        options: [{ allow: ['U+E000..U+F8FF'] }],
      },
    ],
    invalid: [
      {
        name: 'powerline glyph from the private use area',
        code: 'const icon = "\uE0A0";',
        errors: [
          {
            messageId: 'privateUse',
            data: { character: 'U+E0A0', context: 'a string' },
          },
        ],
      },
      {
        name: 'noncharacter in a comment',
        code: '// \uFFFF',
        errors: [{ messageId: 'unassigned' }],
      },
      {
        name: 'unpaired surrogate in a string',
        code: 'const broken = "\uD800";',
        errors: [{ messageId: 'surrogate' }],
      },
    ],
  },
);
