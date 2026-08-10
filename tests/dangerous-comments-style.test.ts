import { RuleTester } from './rule-tester';
import rule from '../src/rules/dangerous-comments-style';
import * as tsParser from '@typescript-eslint/parser';

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
});

ruleTester.run('dangerous-comments-style', rule, {
  valid: [
    {
      code: '// This is a normal comment',
    },
    {
      code: '// Comment with regular hyphen-separated-words',
    },
    {
      code: '// Comment with "regular quotes"',
    },
  ],

  invalid: [
    // Unicode Hyphens - can be fixed
    {
      code: '// Comment with unicode\u2013dash',
      errors: [
        {
          message:
            'Comment contains typographic Unicode artifacts commonly produced by AI text generation. Use plain ASCII.',
        },
      ],
      output: '// Comment with unicode-dash',
    },
    {
      code: '// Non\u2011breaking hyphen',
      errors: [
        {
          message:
            'Comment contains typographic Unicode artifacts commonly produced by AI text generation. Use plain ASCII.',
        },
      ],
      output: '// Non-breaking hyphen',
    },

    // Unicode Quotes - can be fixed
    {
      code: '// Comment with \u201Csmart quotes\u201D',
      errors: [
        {
          message:
            'Comment contains typographic Unicode artifacts commonly produced by AI text generation. Use plain ASCII.',
        },
      ],
      output: '// Comment with "smart quotes"',
    },
    {
      code: '// Single \u2018smart quotes\u2019',
      errors: [
        {
          message:
            'Comment contains typographic Unicode artifacts commonly produced by AI text generation. Use plain ASCII.',
        },
      ],
      output: "// Single 'smart quotes'",
    },

    // Typographic artifacts (AI-generated text tells) - can be fixed
    {
      code: '// Loading\u2026 please wait',
      errors: [
        {
          message:
            'Comment contains typographic Unicode artifacts commonly produced by AI text generation. Use plain ASCII.',
        },
      ],
      output: '// Loading... please wait',
    },
    {
      code: '// Hello\u00A0World',
      errors: [
        {
          message:
            'Comment contains typographic Unicode artifacts commonly produced by AI text generation. Use plain ASCII.',
        },
      ],
      output: '// Hello World',
    },
    {
      code: '// Thin\u2009space between words',
      errors: [
        {
          message:
            'Comment contains typographic Unicode artifacts commonly produced by AI text generation. Use plain ASCII.',
        },
      ],
      output: '// Thin space between words',
    },
    {
      code: '// Figure\u2007space between words',
      errors: [
        {
          message:
            'Comment contains typographic Unicode artifacts commonly produced by AI text generation. Use plain ASCII.',
        },
      ],
      output: '// Figure space between words',
    },
    {
      code: '// \u2022 Bullet point item',
      errors: [
        {
          message:
            'Comment contains typographic Unicode artifacts commonly produced by AI text generation. Use plain ASCII.',
        },
      ],
      output: '// - Bullet point item',
    },

    // Mixed: dash and quotes can be fixed
    {
      code: '// Mixed\u2013dash and \u201Cquotes\u201D',
      errors: [
        {
          message:
            'Comment contains typographic Unicode artifacts commonly produced by AI text generation. Use plain ASCII.',
        },
      ],
      output: '// Mixed-dash and "quotes"',
    },
  ],
});
