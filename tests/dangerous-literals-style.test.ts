import * as tsParser from '@typescript-eslint/parser';
import { RuleTester } from './rule-tester';
import rule from '../src/rules/dangerous-literals-style';

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
});

ruleTester.run('dangerous-literals-style', rule, {
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
  ],

  invalid: [
    // Unicode Hyphens/Dashes
    {
      code: 'const dash = "file\u2013name";',
      errors: [
        {
          message:
            'Unicode hyphens/dashes not allowed. Use ASCII hyphen (-) instead',
        },
      ],
    },
    {
      code: 'const nbHyphen = "non\u2011breaking";',
      errors: [
        {
          message:
            'Unicode hyphens/dashes not allowed. Use ASCII hyphen (-) instead',
        },
      ],
    },

    // Unicode Quotes
    {
      code: 'const smartQuotes = "He said \u201CHello\u201D";',
      errors: [
        {
          message:
            'Unicode quotation marks are forbidden. Use ASCII quotes (\' or ") instead',
        },
      ],
    },
    {
      code: 'const singleSmartQuotes = "It\u2019s working";',
      errors: [
        {
          message:
            'Unicode quotation marks are forbidden. Use ASCII quotes (\' or ") instead',
        },
      ],
    },

    // Complex mixed case - hyphen wins (checked first)
    {
      code: 'const complex = "\u0430ccess\u2013level\u201Cadmin\u201D";',
      errors: [
        {
          message:
            'Unicode hyphens/dashes not allowed. Use ASCII hyphen (-) instead', // First error wins
        },
      ],
    },

    // Typographic artifacts (AI-generated text tells)
    {
      code: 'const ellipsis = "Loading\u2026";',
      errors: [
        {
          message:
            'Non-breaking space, thin/figure space, bullet or ellipsis character detected. Use a regular space, hyphen or three dots (...) instead',
        },
      ],
    },
    {
      code: 'const nbsp = "Hello\u00A0World";',
      errors: [
        {
          message:
            'Non-breaking space, thin/figure space, bullet or ellipsis character detected. Use a regular space, hyphen or three dots (...) instead',
        },
      ],
    },
    {
      code: 'const thinSpace = "Hello\u2009World";',
      errors: [
        {
          message:
            'Non-breaking space, thin/figure space, bullet or ellipsis character detected. Use a regular space, hyphen or three dots (...) instead',
        },
      ],
    },
    {
      code: 'const figureSpace = "Hello\u2007World";',
      errors: [
        {
          message:
            'Non-breaking space, thin/figure space, bullet or ellipsis character detected. Use a regular space, hyphen or three dots (...) instead',
        },
      ],
    },
    {
      code: 'const bullet = "\u2022 List item";',
      errors: [
        {
          message:
            'Non-breaking space, thin/figure space, bullet or ellipsis character detected. Use a regular space, hyphen or three dots (...) instead',
        },
      ],
    },
  ],
});
