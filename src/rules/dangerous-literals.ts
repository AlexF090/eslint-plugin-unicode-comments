import type { Rule } from 'eslint';

interface UnicodePatterns {
  trojanSource: RegExp;
  fullwidthAscii: RegExp;
}

const unicodePatterns: UnicodePatterns = {
  // Trojan Source (Bidirectional Overrides)
  trojanSource: /[\u202A-\u202E\u2066-\u2069]/,

  // Fullwidth ASCII
  fullwidthAscii: /[\uFF01-\uFF5E]/,
};

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion' as const,
    docs: {
      description:
        'Disallow dangerous Unicode characters in string literals (Trojan Source, homographs, obfuscation)',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    messages: {
      dangerousUnicodeLiteral:
        'String literal contains dangerous Unicode characters. Use ASCII only.',
      invisibleCharacters:
        'Invisible, surrogate, private-use or non-characters are not allowed',
      trojanSource:
        'Bidirectional text controls are forbidden (Trojan Source protection)',
      cyrillicHomographs:
        'Cyrillic characters that look like Latin letters are forbidden',
      greekHomographs:
        'Greek characters that look like Latin letters are forbidden',
      mathSymbols:
        'Mathematical alphanumeric symbols that mimic normal letters are forbidden',
      fullwidthAscii:
        'Fullwidth ASCII variants are forbidden. Use regular ASCII characters',
    },
  },
  create(context: Rule.RuleContext): Rule.RuleListener {
    return {
      Literal(node) {
        if (typeof node.value !== 'string') {
          return;
        }

        const value: string = node.value;

        // 1. Invisible, surrogate, private-use or non-characters
        if (
          /[\u00AD\u061C\u180E\u200B-\u200F\u2028\u2029\u202F\u2060-\u2064\uFEFF]/.test(
            value,
          )
        ) {
          context.report({
            node,
            message:
              'Invisible, surrogate, private-use or non-characters are not allowed',
          });
          return;
        }

        // 2. Trojan Source (Bidirectional Overrides)
        if (unicodePatterns.trojanSource.test(value)) {
          context.report({
            node,
            message:
              'Bidirectional text controls are forbidden (Trojan Source protection)',
          });
          return;
        }

        // 3. Cyrillic Homographs
        if (
          /[\u0430\u043E\u0440\u0435\u0443\u0445\u0441\u043A\u043D\u043C\u0442\u0438\u043B\u0432\u0434\u0444\u0433\u0436\u0449\u0448\u044C\u044B\u044A\u044D\u044E\u044F\u0451]/.test(
            value,
          )
        ) {
          context.report({
            node,
            message:
              'Cyrillic characters that look like Latin letters are forbidden',
          });
          return;
        }

        // 4. Greek Homographs
        if (
          /[\u03B1\u03B5\u03B9\u03BA\u03BD\u03BF\u03C1\u03C4\u03C5\u03C7\u0391\u0392\u0395\u0396\u0397\u0399\u039A\u039C\u039D\u039F\u03A1\u03A4\u03A5\u03A7]/.test(
            value,
          )
        ) {
          context.report({
            node,
            message:
              'Greek characters that look like Latin letters are forbidden',
          });
          return;
        }

        // 5. Mathematical Alphanumeric
        if (/[\uD835][\uDC00-\uDFFF]/.test(value)) {
          context.report({
            node,
            message:
              'Mathematical alphanumeric symbols that mimic normal letters are forbidden',
          });
          return;
        }

        // 6. Fullwidth ASCII
        if (unicodePatterns.fullwidthAscii.test(value)) {
          context.report({
            node,
            message:
              'Fullwidth ASCII variants are forbidden. Use regular ASCII characters',
          });
          return;
        }
      },
    };
  },
};

export default rule;
