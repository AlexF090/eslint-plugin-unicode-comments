import { noBidiControl } from '../../src/rules/no-bidi-control.ts';
import { ruleTester } from '../rule-tester.ts';

ruleTester.run('no-bidi-control', noBidiControl, {
  valid: [
    'const isAdmin = false;',
    'const escaped = "\\u202E";',
    {
      code: 'const mark = "a\u200Fb";',
      options: [{ allow: ['U+200F'] }],
    },
  ],
  invalid: [
    {
      name: 'Trojan Source early return in a comment',
      code: 'if (accessLevel != "user") { /*\u202E } \u2066if (isAdmin)\u2069 \u2066 begin admins only */ }',
      errors: [
        {
          messageId: 'bidiControl',
          data: {
            character: 'U+202E RIGHT-TO-LEFT OVERRIDE',
            context: 'a comment',
          },
          line: 1,
          column: 32,
          endColumn: 33,
        },
        {
          messageId: 'bidiControl',
        },
        { messageId: 'bidiControl' },
        { messageId: 'bidiControl' },
      ],
    },
    {
      name: 'stretched string in a string literal is not corrected next to a slash or quote',
      code: 'const access = "user\u202E \u2066// Check if admin\u2069 \u2066";',
      errors: [
        { messageId: 'bidiControl' },
        { messageId: 'bidiControl' },
        { messageId: 'bidiControl' },
        { messageId: 'bidiControl' },
      ],
    },
    {
      name: 'control between letters in a string can be removed',
      code: 'const mark = "a\u200Fb";',
      errors: [
        {
          messageId: 'bidiControl',
        },
      ],
    },
    {
      name: 'grouped run of adjacent controls at the end of a comment next to a slash is not corrected',
      code: 'const a = 1; //\u202E\u2066',
      errors: [
        {
          messageId: 'bidiControl',
          data: {
            character:
              '2 characters starting with U+202E RIGHT-TO-LEFT OVERRIDE',
            context: 'a comment',
          },
          column: 16,
          endColumn: 18,
        },
      ],
    },
  ],
});
