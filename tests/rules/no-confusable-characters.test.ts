import { noConfusableCharacters } from '../../src/rules/no-confusable-characters.ts';
import { ruleTester } from '../rule-tester.ts';

ruleTester.run('no-confusable-characters', noConfusableCharacters, {
  valid: [
    '// Stra\u00DFe, \u00C4rger, caf\u00E9',
    '// \u041F\u0440\u0438\u0432\u0435\u0442 \u043C\u0438\u0440',
    'const label = "React\u3067\u4F5C\u308B";',
    'const area = "10 m\u00B2";',
    {
      code: 'const width = "\uFF11\uFF10\uFF10";',
      options: [{ allow: ['U+FF10..U+FF19'] }],
    },
  ],
  invalid: [
    {
      name: 'Cyrillic a inside a Latin identifier',
      code: 'const p\u0430ssword = "";',
      errors: [
        {
          messageId: 'mixedScript',
          data: {
            script: 'Cyrillic',
            character: 'U+0430 ("\u0430")',
            dominantScript: 'Latin',
            context: 'an identifier',
          },
          column: 8,
        },
      ],
    },
    {
      name: 'Latin e inside a Cyrillic word in a string',
      code: 'const greeting = "\u043F\u0440\u0438\u0432e\u0442";',
      errors: [
        {
          messageId: 'mixedScript',
          data: {
            script: 'Latin',
            character: 'U+0065 ("e")',
            dominantScript: 'Cyrillic',
            context: 'a string',
          },
        },
      ],
    },
    {
      name: 'fullwidth letters imitating ASCII',
      code: 'const role = "\uFF41dmin";',
      errors: [
        {
          messageId: 'lookalike',
          data: {
            character: 'U+FF41 ("\uFF41")',
            context: 'a string',
            imitates: 'a',
          },
          suggestions: [
            {
              messageId: 'suggestAscii',
              output: 'const role = "admin";',
            },
          ],
        },
      ],
    },
    {
      name: 'mathematical bold letter in a comment',
      code: '// \u{1D41A}pprove',
      errors: [{ messageId: 'lookalike', suggestions: 1 }],
    },
  ],
});
