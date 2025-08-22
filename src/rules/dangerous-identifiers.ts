import type { Rule } from 'eslint';

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion' as const,
    docs: {
      description: 'Disallow dangerous Unicode characters in identifiers',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    messages: {
      dangerousUnicodeIdentifier:
        'Identifier contains dangerous Unicode characters. Use ASCII only.',
    },
  },
  create(context: Rule.RuleContext): Rule.RuleListener {
    return {
      Identifier(node) {
        const name: string = node.name;

        // Cyrillic and Greek characters in identifiers
        if (/[\u0430-\u044F\u0451\u0391-\u03A9\u03B1-\u03C9]/.test(name)) {
          context.report({
            node,
            message:
              'Identifiers with Cyrillic or Greek characters are forbidden',
          });
        }
      },
    };
  },
};

// eslint-disable-next-line import/no-default-export
export default rule;
