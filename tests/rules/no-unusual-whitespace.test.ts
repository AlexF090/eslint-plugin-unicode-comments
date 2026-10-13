import { noUnusualWhitespace } from '../../src/rules/no-unusual-whitespace.ts';
import { ruleTester } from '../rule-tester.ts';

ruleTester.run('no-unusual-whitespace', noUnusualWhitespace, {
  valid: [
    'const a = 1;\tconst b = 2;\r\n',
    'const nbsp = "\\u00A0";',
    { code: '// 10\u00A0km', options: [{ allow: ['U+00A0'] }] },
  ],
  invalid: [
    {
      name: 'no-break space between tokens is fixed',
      code: 'const\u00A0a = 1;',
      output: 'const a = 1;',
      errors: [
        {
          messageId: 'unusualWhitespace',
          data: { character: 'U+00A0 NO-BREAK SPACE', context: 'code' },
        },
      ],
    },
    {
      name: 'run of thin spaces in a comment is fixed as one finding',
      code: '// a\u2009\u2009b',
      output: '// a  b',
      errors: [{ messageId: 'unusualWhitespace' }],
    },
    {
      name: 'no-break space in a string is only a suggestion',
      code: 'const unit = "10\u00A0km";',
      output: null,
      errors: [
        {
          messageId: 'unusualWhitespace',
          suggestions: [
            {
              messageId: 'suggestReplacement',
              output: 'const unit = "10 km";',
            },
          ],
        },
      ],
    },
    {
      name: 'no-break space in JSX text is only a suggestion',
      code: 'const element = <p>10\u00A0km</p>;',
      output: null,
      errors: [
        {
          messageId: 'unusualWhitespace',
          suggestions: [
            {
              messageId: 'suggestReplacement',
              output: 'const element = <p>10 km</p>;',
            },
          ],
        },
      ],
    },
    {
      name: 'line separator in a comment is only a suggestion',
      code: '/* a\u2028b */',
      output: null,
      errors: [
        {
          messageId: 'unusualWhitespace',
          suggestions: [
            { messageId: 'suggestReplacement', output: '/* a\nb */' },
          ],
        },
      ],
    },
  ],
});
