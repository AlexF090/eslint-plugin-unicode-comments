import type { Rule } from 'eslint';

const dangerousPattern = new RegExp(
  [
    /[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D]/.source, // Unicode Hyphens
    /[\u2018-\u201F\u2039\u203A]/.source, // Unicode Quotes
    /[\u00A0\u2026\u2007\u2009\u2022]/.source, // Typographic artifacts (NBSP, ellipsis, thin/figure space, bullet)
  ].join('|'),
);

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion' as const,
    docs: {
      description:
        'Disallow typographic Unicode artifacts in template literals that are common tells of unedited AI-generated text',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    messages: {
      dangerousUnicodeTemplateLiteralStyle:
        'Template literal contains typographic Unicode artifacts. Use ASCII only.',
    },
  },
  create(context: Rule.RuleContext): Rule.RuleListener {
    return {
      TemplateLiteral(node) {
        for (const quasi of node.quasis) {
          const text = quasi.value.raw;
          if (dangerousPattern.test(text)) {
            context.report({
              node,
              message:
                'Template literal contains typographic Unicode artifacts. Use ASCII only.',
            });
            return;
          }
        }
      },
    };
  },
};

export default rule;
