import * as tsParser from "@typescript-eslint/parser";
import { RuleTester } from "eslint";
import rule from "../src/rules/dangerous-identifiers";

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    ecmaVersion: "latest",
    sourceType: "module",
  },
});

ruleTester.run("dangerous-identifiers", rule, {
  valid: [
    {
      code: 'const username = "admin";',
    },
    {
      code: "function getUserData() {}",
    },
    {
      code: "class AdminPanel {}",
    },
    {
      code: "const _privateVar = 123;",
    },
    {
      code: 'const $element = document.getElementById("test");',
    },
    {
      code: "const camelCaseVariable = true;",
    },
    {
      code: 'const CONSTANT_VALUE = "config";',
    },
    {
      code: "const user123 = {};",
    },
    // Unicode that's not Cyrillic or Greek should be fine
    {
      code: 'const 中文变量 = "chinese";',
    },
    {
      code: 'const العربية = "arabic";',
    },
  ],

  invalid: [
    // Cyrillic homographs in variable names
    {
      code: 'const usеrname = "admin";', // 'е' is Cyrillic U+0435
      errors: [
        {
          message:
            "Identifiers with Cyrillic or Greek characters are forbidden",
        },
      ],
    },
    {
      code: "const аdmin = true;", // 'а' is Cyrillic U+0430
      errors: [
        {
          message:
            "Identifiers with Cyrillic or Greek characters are forbidden",
        },
      ],
    },
    {
      code: 'let раssword = "secret";', // 'р' and 'а' are Cyrillic
      errors: [
        {
          message:
            "Identifiers with Cyrillic or Greek characters are forbidden",
        },
      ],
    },

    // Greek homographs in identifiers
    {
      code: "const αlpha = 1;", // α is Greek alpha U+03B1
      errors: [
        {
          message:
            "Identifiers with Cyrillic or Greek characters are forbidden",
        },
      ],
    },
    {
      code: "function βeta() {}", // β is Greek beta U+03B2
      errors: [
        {
          message:
            "Identifiers with Cyrillic or Greek characters are forbidden",
        },
      ],
    },
    {
      code: 'const Ωmega = "end";', // Ω is Greek Omega U+03A9
      errors: [
        {
          message:
            "Identifiers with Cyrillic or Greek characters are forbidden",
        },
      ],
    },

    // Mixed Latin and Cyrillic
    {
      code: "const user_аccount = {};", // 'а' is Cyrillic
      errors: [
        {
          message:
            "Identifiers with Cyrillic or Greek characters are forbidden",
        },
      ],
    },
    {
      code: 'const аccess_token = "jwt";', // 'а' is Cyrillic
      errors: [
        {
          message:
            "Identifiers with Cyrillic or Greek characters are forbidden",
        },
      ],
    },

    // Function names
    {
      code: "function getUsеr() {}", // 'е' is Cyrillic
      errors: [
        {
          message:
            "Identifiers with Cyrillic or Greek characters are forbidden",
        },
      ],
    },
    {
      code: "const mуFunction = () => {};", // 'у' is Cyrillic
      errors: [
        {
          message:
            "Identifiers with Cyrillic or Greek characters are forbidden",
        },
      ],
    },

    // Class names
    {
      code: "class Usеr {}", // 'е' is Cyrillic
      errors: [
        {
          message:
            "Identifiers with Cyrillic or Greek characters are forbidden",
        },
      ],
    },
    {
      code: "class ΑdminPanel {}", // Α is Greek Alpha U+0391
      errors: [
        {
          message:
            "Identifiers with Cyrillic or Greek characters are forbidden",
        },
      ],
    },

    // Method names
    {
      code: "const obj = { getUsеr: () => {} };", // 'е' is Cyrillic
      errors: [
        {
          message:
            "Identifiers with Cyrillic or Greek characters are forbidden",
        },
      ],
    },

    // Property access (identifier)
    {
      code: 'user.naмe = "test";', // 'м' is Cyrillic
      errors: [
        {
          message:
            "Identifiers with Cyrillic or Greek characters are forbidden",
        },
      ],
    },

    // Function parameters
    {
      code: "function test(usеr, data) {}", // 'е' is Cyrillic
      errors: [
        {
          message:
            "Identifiers with Cyrillic or Greek characters are forbidden",
        },
      ],
    },

    // Destructuring
    {
      code: "const { naмe } = user;", // 'м' is Cyrillic
      errors: [
        {
          message:
            "Identifiers with Cyrillic or Greek characters are forbidden",
        },
        {
          message:
            "Identifiers with Cyrillic or Greek characters are forbidden",
        },
      ],
    },
    {
      code: "const { name: usеrName } = user;", // 'е' is Cyrillic
      errors: [
        {
          message:
            "Identifiers with Cyrillic or Greek characters are forbidden",
        },
      ],
    },

    // Import/Export (would be identifiers)
    {
      code: 'import { usеr } from "./user";', // 'е' is Cyrillic
      errors: [
        {
          message:
            "Identifiers with Cyrillic or Greek characters are forbidden",
        },
        {
          message:
            "Identifiers with Cyrillic or Greek characters are forbidden",
        },
      ],
    },
    {
      code: "export const аdmin = true;", // 'а' is Cyrillic
      errors: [
        {
          message:
            "Identifiers with Cyrillic or Greek characters are forbidden",
        },
      ],
    },

    // Multiple identifiers in one statement
    {
      code: 'const nаme = "test", age = 25;', // 'а' is Cyrillic
      errors: [
        {
          message:
            "Identifiers with Cyrillic or Greek characters are forbidden",
        },
      ],
    },
  ],
});
