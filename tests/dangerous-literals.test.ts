import * as tsParser from "@typescript-eslint/parser";
import { RuleTester } from "eslint";
import rule from "../src/rules/dangerous-literals";

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    ecmaVersion: "latest",
    sourceType: "module",
  },
});

ruleTester.run("dangerous-literals", rule, {
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
      code: 'const emoji = "😊 Emojis are fine";',
    },
    {
      code: "const number = 123;",
    },
    {
      code: "const boolean = true;",
    },
  ],

  invalid: [
    // Invisible, surrogate, private-use or non-characters
    {
      code: 'const invisible = "text\u200Bwith\u200Cinvisible";',
      errors: [
        {
          message:
            "Invisible, surrogate, private-use or non-characters are not allowed",
        },
      ],
    },
    {
      code: 'const zeroWidth = "hello\u2060world";',
      errors: [
        {
          message:
            "Invisible, surrogate, private-use or non-characters are not allowed",
        },
      ],
    },

    // Trojan Source (Bidirectional Overrides)
    {
      code: 'const trojan = "access_level\u202Eadmin\u202D";',
      errors: [
        {
          message:
            "Bidirectional text controls are forbidden (Trojan Source protection)",
        },
      ],
    },
    {
      code: 'const bidi = "normal\u202Areversed\u202C";',
      errors: [
        {
          message:
            "Bidirectional text controls are forbidden (Trojan Source protection)",
        },
      ],
    },

    // Unicode Hyphens/Dashes
    {
      code: 'const dash = "file\u2013name";',
      errors: [
        {
          message:
            "Unicode hyphens/dashes not allowed. Use ASCII hyphen (-) instead",
        },
      ],
    },
    {
      code: 'const nbHyphen = "non\u2011breaking";',
      errors: [
        {
          message:
            "Unicode hyphens/dashes not allowed. Use ASCII hyphen (-) instead",
        },
      ],
    },

    // Cyrillic Homographs
    {
      code: 'const cyrillic = "usеrname";', // 'е' is Cyrillic
      errors: [
        {
          message:
            "Cyrillic characters that look like Latin letters are forbidden",
        },
      ],
    },
    {
      code: 'const mixed = "аdmin";', // 'а' is Cyrillic
      errors: [
        {
          message:
            "Cyrillic characters that look like Latin letters are forbidden",
        },
      ],
    },

    // Mathematical Alphanumeric
    {
      code: 'const math = "\ud835\udcb6\ud835\udcb7\ud835\udcb8";', // Mathematical script abc
      errors: [
        {
          message:
            "Mathematical alphanumeric symbols that mimic normal letters are forbidden",
        },
      ],
    },

    // Fullwidth ASCII
    {
      code: 'const fullwidth = "Ｈｅｌｌｏ";',
      errors: [
        {
          message:
            "Fullwidth ASCII variants are forbidden. Use regular ASCII characters",
        },
      ],
    },
    {
      code: 'const fullwidthSymbol = "ｍａｉｎ（）";',
      errors: [
        {
          message:
            "Fullwidth ASCII variants are forbidden. Use regular ASCII characters",
        },
      ],
    },

    // Unicode Quotes
    {
      code: 'const smartQuotes = "He said \u201CHello\u201D";',
      errors: [
        {
          message:
            "Unicode quotation marks are forbidden. Use ASCII quotes (' or \") instead",
        },
      ],
    },
    {
      code: 'const singleSmartQuotes = "It\u2019s working";',
      errors: [
        {
          message:
            "Unicode quotation marks are forbidden. Use ASCII quotes (' or \") instead",
        },
      ],
    },

    // Complex mixed cases
    {
      code: 'const complex = "аccess\u2013level\u201Cadmin\u201D";',
      errors: [
        {
          message:
            "Unicode hyphens/dashes not allowed. Use ASCII hyphen (-) instead", // First error wins
        },
      ],
    },

    // String in array
    {
      code: 'const arr = ["normal", "dаngerous"];',
      errors: [
        {
          message:
            "Cyrillic characters that look like Latin letters are forbidden",
        },
      ],
    },

    // String in object
    {
      code: 'const obj = { key: "vаlue" };',
      errors: [
        {
          message:
            "Cyrillic characters that look like Latin letters are forbidden",
        },
      ],
    },

    // Function parameter default
    {
      code: 'function test(param = "defаult") {}',
      errors: [
        {
          message:
            "Cyrillic characters that look like Latin letters are forbidden",
        },
      ],
    },
  ],
});
