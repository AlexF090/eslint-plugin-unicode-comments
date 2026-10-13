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
      name: 'multiplication sign gets a suggestion, because x is a letter',
      code: '// a 3\u00D74 grid',
      output: null,
      errors: [
        {
          messageId: 'typographic',
          suggestions: [
            { messageId: 'suggestReplacement', output: '// a 3x4 grid' },
          ],
        },
      ],
    },
    {
      name: 'typographic character in a comment gets no suggestion',
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
          suggestions: [],
        },
      ],
    },
    {
      name: 'string literal gets neither a fix nor a suggestion',
      code: 'const message = "Wait\u2026";',
      output: null,
      errors: [
        {
          messageId: 'typographic',
          suggestions: [],
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
      name: 'JSX text gets no suggestion',
      code: 'const element = <p>Loading\u2026</p>;',
      output: null,
      errors: [
        {
          messageId: 'typographic',
          suggestions: [],
        },
      ],
    },
  ],
});
