import * as tsParser from '@typescript-eslint/parser';
import { RuleTester } from 'eslint';
import rule from '../src/rules/dangerous-literals';

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
});

ruleTester.run('dangerous-literals', rule, {
  valid: [
    {
      code: 'const message = "Hello world";',
    },
    {
      code: 'const path = "regular-file-name.txt";',
    },
    {
      code: 'const quote = "Regular \\"quotes\\" work fine";',
    },
    {
      code: 'const emoji = "\ud83d\ude0a Emojis are fine";',
    },
    {
      code: 'const number = 123;',
    },
    {
      code: 'const boolean = true;',
    },
  ],

  invalid: [
    // Invisible, surrogate, private-use or non-characters
    {
      code: 'const invisible = "text\u200Bwith\u200Cinvisible";',
      errors: [
        {
          message:
            'Invisible, surrogate, private-use or non-characters are not allowed',
        },
      ],
    },
    {
      code: 'const zeroWidth = "hello\u2060world";',
      errors: [
        {
          message:
            'Invisible, surrogate, private-use or non-characters are not allowed',
        },
      ],
    },

    // Trojan Source (Bidirectional Overrides)
    {
      code: 'const trojan = "access_level\u202Eadmin\u202D";',
      errors: [
        {
          message:
            'Bidirectional text controls are forbidden (Trojan Source protection)',
        },
      ],
    },
    {
      code: 'const bidi = "normal\u202Areversed\u202C";',
      errors: [
        {
          message:
            'Bidirectional text controls are forbidden (Trojan Source protection)',
        },
      ],
    },

    // Cyrillic Homographs
    {
      code: 'const cyrillic = "us\u0435rname";', // 'е' is Cyrillic
      errors: [
        {
          message:
            'Cyrillic characters that look like Latin letters are forbidden',
        },
      ],
    },
    {
      code: 'const mixed = "\u0430dmin";', // 'а' is Cyrillic
      errors: [
        {
          message:
            'Cyrillic characters that look like Latin letters are forbidden',
        },
      ],
    },

    // Mathematical Alphanumeric
    {
      code: 'const math = "\ud835\udcb6\ud835\udcb7\ud835\udcb8";', // Mathematical script abc
      errors: [
        {
          message:
            'Mathematical alphanumeric symbols that mimic normal letters are forbidden',
        },
      ],
    },

    // Fullwidth ASCII
    {
      code: 'const fullwidth = "\uFF28\uFF45\uFF4C\uFF4C\uFF4F";',
      errors: [
        {
          message:
            'Fullwidth ASCII variants are forbidden. Use regular ASCII characters',
        },
      ],
    },
    {
      code: 'const fullwidthSymbol = "\uFF4D\uFF41\uFF49\uFF08\uFF09";',
      errors: [
        {
          message:
            'Fullwidth ASCII variants are forbidden. Use regular ASCII characters',
        },
      ],
    },

    // String in array
    {
      code: 'const arr = ["normal", "d\u0430ngerous"];',
      errors: [
        {
          message:
            'Cyrillic characters that look like Latin letters are forbidden',
        },
      ],
    },

    // String in object
    {
      code: 'const obj = { key: "v\u0430lue" };',
      errors: [
        {
          message:
            'Cyrillic characters that look like Latin letters are forbidden',
        },
      ],
    },

    // Function parameter default
    {
      code: 'function test(param = "def\u0430ult") {}',
      errors: [
        {
          message:
            'Cyrillic characters that look like Latin letters are forbidden',
        },
      ],
    },
  ],
});
