import * as tsParser from "@typescript-eslint/parser";
import { RuleTester } from "eslint";
import rule from "../src/rules/dangerous-template-literals";

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    ecmaVersion: "latest",
    sourceType: "module",
  },
});

ruleTester.run("dangerous-template-literals", rule, {
  valid: [
    {
      code: "const message = `Hello world`;",
    },
    {
      code: "const interpolated = `Hello ${name}`;",
    },
    {
      code: "const multiline = `\n  Multiple\n  lines\n  are fine\n`;",
    },
    {
      code: 'const withQuotes = `Regular "quotes" work fine`;',
    },
    {
      code: "const emoji = `😊 Emojis are fine ${user}`;",
    },
    {
      code: "const complex = `${prefix}-${id}-${suffix}`;",
    },
    {
      code: "const sql = `SELECT * FROM users WHERE id = ${userId}`;",
    },
  ],

  invalid: [
    // Trojan Source (Bidirectional Overrides)
    {
      code: "const trojan = `access_level\u202Eadmin\u202D`;",
      errors: [
        {
          message:
            "Template literal contains dangerous Unicode characters. Use ASCII only.",
        },
      ],
    },
    {
      code: "const bidi = `normal\u202Areversed\u202C text`;",
      errors: [
        {
          message:
            "Template literal contains dangerous Unicode characters. Use ASCII only.",
        },
      ],
    },
    {
      code: "const interpolatedTrojan = `User: ${user}\u202Eadmin\u202D`;",
      errors: [
        {
          message:
            "Template literal contains dangerous Unicode characters. Use ASCII only.",
        },
      ],
    },

    // Unicode Hyphens/Dashes
    {
      code: "const dash = `file\u2013name.txt`;",
      errors: [
        {
          message:
            "Template literal contains dangerous Unicode characters. Use ASCII only.",
        },
      ],
    },
    {
      code: "const nbHyphen = `non\u2011breaking hyphen`;",
      errors: [
        {
          message:
            "Template literal contains dangerous Unicode characters. Use ASCII only.",
        },
      ],
    },
    {
      code: "const templateDash = `${prefix}\u2014${suffix}`;",
      errors: [
        {
          message:
            "Template literal contains dangerous Unicode characters. Use ASCII only.",
        },
      ],
    },

    // Cyrillic Homographs
    {
      code: "const cyrillic = `usеrname: ${user}`;", // 'е' is Cyrillic
      errors: [
        {
          message:
            "Template literal contains dangerous Unicode characters. Use ASCII only.",
        },
      ],
    },
    {
      code: "const mixed = `Welcome аdmin!`;", // 'а' is Cyrillic in text
      errors: [
        {
          message:
            "Template literal contains dangerous Unicode characters. Use ASCII only.",
        },
      ],
    },
    {
      code: "const query = `SELECT * FROM usеrs WHERE id = ${id}`;", // 'е' is Cyrillic
      errors: [
        {
          message:
            "Template literal contains dangerous Unicode characters. Use ASCII only.",
        },
      ],
    },

    // Greek Homographs
    {
      code: "const greek = `αlpha value: ${value}`;", // α is Greek alpha
      errors: [
        {
          message:
            "Template literal contains dangerous Unicode characters. Use ASCII only.",
        },
      ],
    },
    {
      code: "const greekTemplate = `Ωmega point reached`;", // Ω is Greek Omega
      errors: [
        {
          message:
            "Template literal contains dangerous Unicode characters. Use ASCII only.",
        },
      ],
    },

    // Mathematical Alphanumeric
    {
      code: "const math = `\ud835\udcb6\ud835\udcb7\ud835\udcb8 equation`;", // Mathematical script abc
      errors: [
        {
          message:
            "Template literal contains dangerous Unicode characters. Use ASCII only.",
        },
      ],
    },
    {
      code: "const mathTemplate = `Formula: \ud835\udd1e = ${value}`;", // Mathematical double-struck A
      errors: [
        {
          message:
            "Template literal contains dangerous Unicode characters. Use ASCII only.",
        },
      ],
    },

    // Fullwidth ASCII
    {
      code: "const fullwidth = `Ｈｅｌｌｏ ${name}`;",
      errors: [
        {
          message:
            "Template literal contains dangerous Unicode characters. Use ASCII only.",
        },
      ],
    },
    {
      code: "const fullwidthSymbol = `ｍａｉｎ（${args}）`;",
      errors: [
        {
          message:
            "Template literal contains dangerous Unicode characters. Use ASCII only.",
        },
      ],
    },

    // Zero-width/Invisible characters
    {
      code: "const invisible = `text\u200Bwith\u200Cinvisible chars`;",
      errors: [
        {
          message:
            "Template literal contains dangerous Unicode characters. Use ASCII only.",
        },
      ],
    },
    {
      code: "const zeroWidth = `hello\u2060world ${name}`;",
      errors: [
        {
          message:
            "Template literal contains dangerous Unicode characters. Use ASCII only.",
        },
      ],
    },

    // Unicode Quotes
    {
      code: "const smartQuotes = `He said \u201CHello\u201D to ${name}`;",
      errors: [
        {
          message:
            "Template literal contains dangerous Unicode characters. Use ASCII only.",
        },
      ],
    },
    {
      code: "const singleSmartQuotes = `It\u2019s working with ${value}`;",
      errors: [
        {
          message:
            "Template literal contains dangerous Unicode characters. Use ASCII only.",
        },
      ],
    },

    // Complex mixed cases
    {
      code: "const complex = `аccess\u2013level\u201Cadmin\u201D: ${level}`;",
      errors: [
        {
          message:
            "Template literal contains dangerous Unicode characters. Use ASCII only.",
        },
      ],
    },

    // HTML/CSS with dangerous unicode
    {
      code: 'const html = `<div class="usеr-card">${content}</div>`;', // 'е' is Cyrillic
      errors: [
        {
          message:
            "Template literal contains dangerous Unicode characters. Use ASCII only.",
        },
      ],
    },
    {
      code: "const css = `color: ${color}; fоnt-size: 14px;`;", // 'о' is Cyrillic
      errors: [
        {
          message:
            "Template literal contains dangerous Unicode characters. Use ASCII only.",
        },
      ],
    },

    // URL/Path templates with dangerous chars
    {
      code: "const url = `https://api.example.com/usеrs/${id}`;", // 'е' is Cyrillic
      errors: [
        {
          message:
            "Template literal contains dangerous Unicode characters. Use ASCII only.",
        },
      ],
    },
    {
      code: "const path = `/admin\u2013panel/${section}`;", // unicode dash
      errors: [
        {
          message:
            "Template literal contains dangerous Unicode characters. Use ASCII only.",
        },
      ],
    },
  ],
});
