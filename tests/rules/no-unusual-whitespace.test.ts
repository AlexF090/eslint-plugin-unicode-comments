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
      name: 'run of thin spaces in a comment is reported as one finding without a correction',
      code: '// a\u2009\u2009b',
      output: null,
      errors: [
        {
          messageId: 'unusualWhitespace',
        },
      ],
    },
    {
      name: 'no-break space in a string is not corrected',
      code: 'const unit = "10\u00A0km";',
      output: null,
      errors: [
        {
          messageId: 'unusualWhitespace',
        },
      ],
    },
    {
      name: 'no-break space in JSX text is not corrected',
      code: 'const element = <p>10\u00A0km</p>;',
      output: null,
      errors: [
        {
          messageId: 'unusualWhitespace',
        },
      ],
    },
    {
      name: 'line separator in a comment is not corrected',
      code: '/* a\u2028b */',
      output: null,
      errors: [
        {
          messageId: 'unusualWhitespace',
        },
      ],
    },
  ],
});
