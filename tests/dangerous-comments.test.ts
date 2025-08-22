import { RuleTester } from "eslint";
import rule from "../src/rules/dangerous-comments";
import * as tsParser from "@typescript-eslint/parser";

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    ecmaVersion: "latest",
    sourceType: "module",
  },
});

ruleTester.run("dangerous-comments", rule, {
  valid: [
    {
      code: "// This is a normal comment",
    },
    {
      code: "/* Block comment with normal ASCII */",
    },
    {
      code: `/**
       * JSDoc comment
       * @param {string} value - Normal parameter
       */`,
    },
    {
      code: "// Comment with regular hyphen-separated-words",
    },
    {
      code: '// Comment with "regular quotes"',
    },
  ],

  invalid: [
    // Trojan Source (Bidirectional Overrides) - detect only
    {
      code: "// Comment with \u202E override",
      errors: [
        {
          message:
            "Comment contains dangerous Unicode characters. Use ASCII only.",
        },
      ],
    },
    {
      code: "/* Block with \u202A isolate */",
      errors: [
        {
          message:
            "Comment contains dangerous Unicode characters. Use ASCII only.",
        },
      ],
    },

    // Unicode Hyphens - can be fixed
    {
      code: "// Comment with unicode\u2013dash",
      errors: [
        {
          message:
            "Comment contains dangerous Unicode characters. Use ASCII only.",
        },
      ],
      output: "// Comment with unicode-dash",
    },
    {
      code: "// Non\u2011breaking hyphen",
      errors: [
        {
          message:
            "Comment contains dangerous Unicode characters. Use ASCII only.",
        },
      ],
      output: "// Non-breaking hyphen",
    },

    // Unicode Quotes - can be fixed
    {
      code: "// Comment with \u201Csmart quotes\u201D",
      errors: [
        {
          message:
            "Comment contains dangerous Unicode characters. Use ASCII only.",
        },
      ],
      output: '// Comment with "smart quotes"',
    },
    {
      code: "// Single \u2018smart quotes\u2019",
      errors: [
        {
          message:
            "Comment contains dangerous Unicode characters. Use ASCII only.",
        },
      ],
      output: "// Single 'smart quotes'",
    },

    // Cyrillic Homographs - detect only
    {
      code: "// Commеnt with cyrillіc chars",
      errors: [
        {
          message:
            "Comment contains dangerous Unicode characters. Use ASCII only.",
        },
      ],
    },

    // Greek Homographs - detect only
    {
      code: "// Grεεk characters іn comment",
      errors: [
        {
          message:
            "Comment contains dangerous Unicode characters. Use ASCII only.",
        },
      ],
    },

    // Mathematical Alphanumeric - detect only
    {
      code: "// \ud835\udcb6\ud835\udcb6\ud835\udcb6 math symbols",
      errors: [
        {
          message:
            "Comment contains dangerous Unicode characters. Use ASCII only.",
        },
      ],
    },

    // Fullwidth ASCII - detect only
    {
      code: "// Ｆｕｌｌｗｉｄｔｈ ＡＳＣＩＩ",
      errors: [
        {
          message:
            "Comment contains dangerous Unicode characters. Use ASCII only.",
        },
      ],
    },

    // Zero-width/Invisible characters - detect only
    {
      code: "// Comment\u200B\u200C\u200D with invisible chars",
      errors: [
        {
          message:
            "Comment contains dangerous Unicode characters. Use ASCII only.",
        },
      ],
    },

    // Mixed: dash and quotes can be fixed, cyrillic detected
    {
      code: "// Mixed\u2013dash and \u201Cquotes\u201D with cyrillіc",
      errors: [
        {
          message:
            "Comment contains dangerous Unicode characters. Use ASCII only.",
        },
      ],
      output: '// Mixed-dash and "quotes" with cyrillіc',
    },
  ],
});
