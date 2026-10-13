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
      name: 'typographic character in a comment is only a suggestion',
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
          suggestions: [
            {
              messageId: 'suggestReplacement',
              output: '// This function -- returns',
            },
          ],
        },
      ],
    },
    {
      name: 'string literal gets a suggestion instead of a fix',
      code: 'const message = "Wait\u2026";',
      output: null,
      errors: [
        {
          messageId: 'typographic',
          suggestions: [
            {
              messageId: 'suggestReplacement',
              output: 'const message = "Wait...";',
            },
          ],
        },
      ],
    },
    {
      name: 'quote in a string gets no suggestion, because it could end the string',
      code: 'const message = "x\u201D; fetch(1); \u201Cy";',
      output: null,
      errors: [
        { messageId: 'typographic', suggestions: [] },
        { messageId: 'typographic', suggestions: [] },
      ],
    },
    {
      name: 'JSX text gets a suggestion because it is rendered',
      code: 'const element = <p>Loading\u2026</p>;',
      output: null,
      errors: [
        {
          messageId: 'typographic',
          suggestions: [
            {
              messageId: 'suggestReplacement',
              output: 'const element = <p>Loading...</p>;',
            },
          ],
        },
      ],
    },
  ],
});
