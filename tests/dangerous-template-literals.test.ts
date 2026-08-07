import * as tsParser from '@typescript-eslint/parser';
import { RuleTester } from 'eslint';
import rule from '../src/rules/dangerous-template-literals';

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
});

ruleTester.run('dangerous-template-literals', rule, {
  valid: [
    {
      code: 'const message = `Hello world`;',
    },
    {
      code: 'const interpolated = `Hello ${name}`;',
    },
    {
      code: 'const multiline = `\n  Multiple\n  lines\n  are fine\n`;',
    },
    {
      code: 'const withQuotes = `Regular "quotes" work fine`;',
    },
    {
      code: 'const emoji = `\ud83d\ude0a Emojis are fine ${user}`;',
    },
    {
      code: 'const complex = `${prefix}-${id}-${suffix}`;',
    },
    {
      code: 'const sql = `SELECT * FROM users WHERE id = ${userId}`;',
    },
  ],

  invalid: [
    // Trojan Source (Bidirectional Overrides)
    {
      code: 'const trojan = `access_level\u202Eadmin\u202D`;',
      errors: [
        {
          message:
            'Template literal contains dangerous Unicode characters. Use ASCII only.',
        },
      ],
    },
    {
      code: 'const bidi = `normal\u202Areversed\u202C text`;',
      errors: [
        {
          message:
            'Template literal contains dangerous Unicode characters. Use ASCII only.',
        },
      ],
    },
    {
      code: 'const interpolatedTrojan = `User: ${user}\u202Eadmin\u202D`;',
      errors: [
        {
          message:
            'Template literal contains dangerous Unicode characters. Use ASCII only.',
        },
      ],
    },

    // Cyrillic Homographs
    {
      code: 'const cyrillic = `us\u0435rname: ${user}`;', // 'е' is Cyrillic
      errors: [
        {
          message:
            'Template literal contains dangerous Unicode characters. Use ASCII only.',
        },
      ],
    },
    {
      code: 'const mixed = `Welcome \u0430dmin!`;', // 'а' is Cyrillic in text
      errors: [
        {
          message:
            'Template literal contains dangerous Unicode characters. Use ASCII only.',
        },
      ],
    },
    {
      code: 'const query = `SELECT * FROM us\u0435rs WHERE id = ${id}`;', // 'е' is Cyrillic
      errors: [
        {
          message:
            'Template literal contains dangerous Unicode characters. Use ASCII only.',
        },
      ],
    },

    // Greek Homographs
    {
      code: 'const greek = `\u03B1lpha value: ${value}`;', // α is Greek alpha
      errors: [
        {
          message:
            'Template literal contains dangerous Unicode characters. Use ASCII only.',
        },
      ],
    },
    {
      code: 'const greekTemplate = `\u0395psilon point reached`;', // Ε is Greek Epsilon
      errors: [
        {
          message:
            'Template literal contains dangerous Unicode characters. Use ASCII only.',
        },
      ],
    },

    // Mathematical Alphanumeric
    {
      code: 'const math = `\ud835\udcb6\ud835\udcb7\ud835\udcb8 equation`;', // Mathematical script abc
      errors: [
        {
          message:
            'Template literal contains dangerous Unicode characters. Use ASCII only.',
        },
      ],
    },
    {
      code: 'const mathTemplate = `Formula: \ud835\udd1e = ${value}`;', // Mathematical double-struck A
      errors: [
        {
          message:
            'Template literal contains dangerous Unicode characters. Use ASCII only.',
        },
      ],
    },

    // Fullwidth ASCII
    {
      code: 'const fullwidth = `\uFF28\uFF45\uFF4C\uFF4C\uFF4F ${name}`;',
      errors: [
        {
          message:
            'Template literal contains dangerous Unicode characters. Use ASCII only.',
        },
      ],
    },
    {
      code: 'const fullwidthSymbol = `\uFF4D\uFF41\uFF49\uFF08${args}\uFF09`;',
      errors: [
        {
          message:
            'Template literal contains dangerous Unicode characters. Use ASCII only.',
        },
      ],
    },

    // Zero-width/Invisible characters
    {
      code: 'const invisible = `text\u200Bwith\u200Cinvisible chars`;',
      errors: [
        {
          message:
            'Template literal contains dangerous Unicode characters. Use ASCII only.',
        },
      ],
    },
    {
      code: 'const zeroWidth = `hello\u2060world ${name}`;',
      errors: [
        {
          message:
            'Template literal contains dangerous Unicode characters. Use ASCII only.',
        },
      ],
    },

    // HTML/CSS with dangerous unicode
    {
      code: 'const html = `<div class="us\u0435r-card">${content}</div>`;', // 'е' is Cyrillic
      errors: [
        {
          message:
            'Template literal contains dangerous Unicode characters. Use ASCII only.',
        },
      ],
    },
    {
      code: 'const css = `color: ${color}; f\u043Ent-size: 14px;`;', // 'о' is Cyrillic
      errors: [
        {
          message:
            'Template literal contains dangerous Unicode characters. Use ASCII only.',
        },
      ],
    },

    // URL/Path templates with dangerous chars
    {
      code: 'const url = `https://api.example.com/us\u0435rs/${id}`;', // 'е' is Cyrillic
      errors: [
        {
          message:
            'Template literal contains dangerous Unicode characters. Use ASCII only.',
        },
      ],
    },
  ],
});
