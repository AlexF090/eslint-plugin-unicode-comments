import * as tsParser from '@typescript-eslint/parser';
import { RuleTester } from 'eslint';
import rule from '../src/rules/dangerous-template-literals-style';

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
});

ruleTester.run('dangerous-template-literals-style', rule, {
  valid: [
    {
      code: 'const message = `Hello world`;',
    },
    {
      code: 'const interpolated = `Hello ${name}`;',
    },
    {
      code: 'const withQuotes = `Regular "quotes" work fine`;',
    },
  ],

  invalid: [
    // Unicode Hyphens/Dashes
    {
      code: 'const dash = `file\u2013name.txt`;',
      errors: [
        {
          message:
            'Template literal contains typographic Unicode artifacts. Use ASCII only.',
        },
      ],
    },
    {
      code: 'const nbHyphen = `non\u2011breaking hyphen`;',
      errors: [
        {
          message:
            'Template literal contains typographic Unicode artifacts. Use ASCII only.',
        },
      ],
    },
    {
      code: 'const templateDash = `${prefix}\u2014${suffix}`;',
      errors: [
        {
          message:
            'Template literal contains typographic Unicode artifacts. Use ASCII only.',
        },
      ],
    },

    // Unicode Quotes
    {
      code: 'const smartQuotes = `He said \u201CHello\u201D to ${name}`;',
      errors: [
        {
          message:
            'Template literal contains typographic Unicode artifacts. Use ASCII only.',
        },
      ],
    },
    {
      code: 'const singleSmartQuotes = `It\u2019s working with ${value}`;',
      errors: [
        {
          message:
            'Template literal contains typographic Unicode artifacts. Use ASCII only.',
        },
      ],
    },

    // Typographic artifacts (AI-generated text tells)
    {
      code: 'const ellipsis = `Loading\u2026 ${status}`;',
      errors: [
        {
          message:
            'Template literal contains typographic Unicode artifacts. Use ASCII only.',
        },
      ],
    },
    {
      code: 'const nbsp = `Hello\u00A0World`;',
      errors: [
        {
          message:
            'Template literal contains typographic Unicode artifacts. Use ASCII only.',
        },
      ],
    },
    {
      code: 'const thinSpace = `Hello\u2009World`;',
      errors: [
        {
          message:
            'Template literal contains typographic Unicode artifacts. Use ASCII only.',
        },
      ],
    },
    {
      code: 'const bullet = `\u2022 List item ${x}`;',
      errors: [
        {
          message:
            'Template literal contains typographic Unicode artifacts. Use ASCII only.',
        },
      ],
    },

    // Path templates with unicode dash
    {
      code: 'const path = `/admin\u2013panel/${section}`;', // unicode dash
      errors: [
        {
          message:
            'Template literal contains typographic Unicode artifacts. Use ASCII only.',
        },
      ],
    },
  ],
});
