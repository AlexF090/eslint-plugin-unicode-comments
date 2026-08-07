import type { Rule } from 'eslint';

const dangerousPattern = new RegExp(
  [
    /[\u202A-\u202E\u2066-\u2069]/.source, // Trojan Source
    /[\u0430\u043E\u0440\u0435\u0443\u0445\u0441\u0440\u043A\u043D\u043C\u0442\u0438\u043B\u0432\u0434\u0444\u0433\u0436\u0449\u0448\u044C\u044B\u044A\u044D\u044E\u044F\u0451]/
      .source, // Cyrillic Homographs
    /[\u03B1\u03B5\u03B9\u03BA\u03BD\u03BF\u03C1\u03C4\u03C5\u03C7\u0391\u0392\u0395\u0396\u0397\u0399\u039A\u039C\u039D\u039F\u03A1\u03A4\u03A5\u03A7]/
      .source, // Greek Homographs
    /[\uD835][\uDC00-\uDFFF]/.source, // Mathematical Alphanumeric
    /[\uFF01-\uFF5E]/.source, // Fullwidth ASCII
    /[\u00AD\u061C\u180E\u200B-\u200F\u2028\u2029\u202F\u2060-\u2064\uFEFF]/
      .source, // Zero-width/Invisible
  ].join('|'),
);

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion' as const,
    docs: {
      description:
        'Disallow dangerous Unicode characters in comments (Trojan Source, homographs, obfuscation)',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    messages: {
      dangerousUnicode:
        'Comment contains dangerous Unicode characters. Use ASCII only.',
    },
  },
  create(context: Rule.RuleContext): Rule.RuleListener {
    return {
      Program() {
        const sourceCode = context.sourceCode;
        const comments = sourceCode.getAllComments();

        comments.forEach((comment) => {
          if (dangerousPattern.test(comment.value)) {
            context.report({
              loc: comment.loc!,
              message:
                'Comment contains dangerous Unicode characters. Use ASCII only.',
            });
          }
        });
      },
    };
  },
};

export default rule;
