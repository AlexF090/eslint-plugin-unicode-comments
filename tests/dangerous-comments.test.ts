import { RuleTester } from './rule-tester';
import rule from '../src/rules/dangerous-comments';
import * as tsParser from '@typescript-eslint/parser';

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
});

ruleTester.run('dangerous-comments', rule, {
  valid: [
    {
      code: '// This is a normal comment',
    },
    {
      code: '/* Block comment with normal ASCII */',
    },
    {
      code: `/**
       * JSDoc comment
       * @param {string} value - Normal parameter
       */`,
    },
    {
      code: '// Comment with regular hyphen-separated-words',
    },
    {
      code: '// Comment with "regular quotes"',
    },
  ],

  invalid: [
    // Trojan Source (Bidirectional Overrides)
    {
      code: '// Comment with ‮ override',
      errors: [
        {
          message:
            'Comment contains dangerous Unicode characters. Use ASCII only.',
        },
      ],
    },
    {
      code: '/* Block with ‪ isolate */',
      errors: [
        {
          message:
            'Comment contains dangerous Unicode characters. Use ASCII only.',
        },
      ],
    },

    // Cyrillic Homographs
    {
      code: '// Commеnt with cyrillіc chars',
      errors: [
        {
          message:
            'Comment contains dangerous Unicode characters. Use ASCII only.',
        },
      ],
    },

    // Greek Homographs
    {
      code: '// Grεεk characters іn comment',
      errors: [
        {
          message:
            'Comment contains dangerous Unicode characters. Use ASCII only.',
        },
      ],
    },

    // Mathematical Alphanumeric
    {
      code: '// 𝒶𝒶𝒶 math symbols',
      errors: [
        {
          message:
            'Comment contains dangerous Unicode characters. Use ASCII only.',
        },
      ],
    },

    // Fullwidth ASCII
    {
      code: '// Ｆｕｌｌｗｉｄｔｈ ＡＳＣＩＩ',
      errors: [
        {
          message:
            'Comment contains dangerous Unicode characters. Use ASCII only.',
        },
      ],
    },

    // Zero-width/Invisible characters
    {
      code: '// Comment​‌‍ with invisible chars',
      errors: [
        {
          message:
            'Comment contains dangerous Unicode characters. Use ASCII only.',
        },
      ],
    },
  ],
});
