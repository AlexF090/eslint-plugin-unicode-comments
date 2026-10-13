import {
  allowedCharacters,
  strictContextPolicy,
} from '../../src/rules/allowed-characters.ts';
import { ruleTester } from '../rule-tester.ts';

ruleTester.run('allowed-characters', allowedCharacters, {
  valid: [
    'const greeting = "Gr\u00FC\u00DFe \u{1F44B}";',
    '// \u4E2D\u6587\u6CE8\u91CA \u2713',
    'const element = <p>Caf\u00E9</p>;',
    {
      code: 'const gr\u00F6\u00DFe = 1;',
      options: [{ identifier: ['\\p{Script=Latin}'] }],
    },
    {
      code: '// Gr\u00FC\u00DFe',
      options: [{ ...strictContextPolicy, comment: ['\u00FC', 'U+00DF'] }],
    },
  ],
  invalid: [
    {
      name: 'non-ASCII identifier with the recommended policy',
      code: 'const gr\u00F6\u00DFe = 1;',
      errors: [
        {
          messageId: 'notAllowed',
          data: {
            character: 'U+00F6 ("\u00F6")',
            context: 'an identifier',
          },
          column: 9,
        },
        { messageId: 'notAllowed', column: 10 },
      ],
    },
    {
      name: 'strict policy rejects letters in comments',
      code: '// Gr\u00FC\u00DFe',
      options: [strictContextPolicy],
      errors: [{ messageId: 'notAllowed' }, { messageId: 'notAllowed' }],
    },
    {
      name: 'overriding one context keeps the defaults of the others',
      code: '// \u00FC\nconst s = "\u00FC";',
      options: [{ string: [] }],
      errors: [{ messageId: 'notAllowed', line: 2 }],
    },
  ],
});
