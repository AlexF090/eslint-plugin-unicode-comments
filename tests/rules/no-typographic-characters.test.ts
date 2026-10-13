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
      name: 'AI-style comment is fixed',
      code: '// This function \u2014 as \u201Cexpected\u201D \u2192 returns\u2026',
      output: '// This function -- as "expected" -> returns...',
      errors: [
        {
          messageId: 'typographic',
          data: {
            character: 'U+2014 EM DASH ("\u2014")',
            context: 'a comment',
            replacement: '--',
          },
        },
        { messageId: 'typographic' },
        { messageId: 'typographic' },
        { messageId: 'typographic' },
        { messageId: 'typographic' },
      ],
    },
    {
      name: 'string literal gets a suggestion instead of a fix',
      code: 'const message = "Don\u2019t";',
      output: null,
      errors: [
        {
          messageId: 'typographic',
          suggestions: [
            {
              messageId: 'suggestReplacement',
              output: 'const message = "Don\'t";',
            },
          ],
        },
      ],
    },
    {
      name: 'JSX text is fixed',
      code: 'const element = <p>Loading\u2026</p>;',
      output: 'const element = <p>Loading...</p>;',
      errors: [{ messageId: 'typographic' }],
    },
  ],
});
