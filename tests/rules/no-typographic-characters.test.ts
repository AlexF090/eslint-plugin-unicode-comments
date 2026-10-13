import { noTypographicCharacters } from '../../src/rules/no-typographic-characters.ts';
import { ruleTester } from '../rule-tester.ts';

ruleTester.run('no-typographic-characters', noTypographicCharacters, {
  valid: [
    '// plain -- ascii "quotes" and ... dots -> arrows',
    'const dash = "\\u2014";',
    { code: '// a \u2192 b', options: [{ allow: ['\u2192'] }] },
  ],
  invalid: [
    {
      name: 'multiplication sign in a comment is not corrected',
      code: '// a 3\u00D74 grid',
      output: null,
      errors: [
        {
          messageId: 'typographic',
        },
      ],
    },
    {
      name: 'typographic character in a comment is not corrected',
      code: '// This function \u2014 returns',
      output: null,
      errors: [
        {
          messageId: 'typographic',
          data: {
            character: 'U+2014 EM DASH ("\u2014")',
            context: 'a comment',
            replacement: '--',
          },
        },
      ],
    },
    {
      name: 'string literal is not corrected',
      code: 'const message = "Wait\u2026";',
      output: null,
      errors: [
        {
          messageId: 'typographic',
        },
      ],
    },
    {
      name: 'quote in a string is not corrected, because it could end the string',
      code: 'const message = "x\u201D; fetch(1); \u201Cy";',
      output: null,
      errors: [{ messageId: 'typographic' }, { messageId: 'typographic' }],
    },
    {
      name: 'JSX text is not corrected',
      code: 'const element = <p>Loading\u2026</p>;',
      output: null,
      errors: [
        {
          messageId: 'typographic',
        },
      ],
    },
  ],
});
