const rule = {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Disallow dangerous Unicode characters in identifiers',
            category: 'Best Practices',
            recommended: true,
        },
        fixable: undefined,
        schema: [],
        messages: {
            dangerousUnicodeIdentifier: 'Identifier contains dangerous Unicode characters. Use ASCII only.',
        },
    },
    create(context) {
        return {
            Identifier(node) {
                const name = node.name;
                // Cyrillic and Greek characters in identifiers
                if (/[\u0430-\u044F\u0451\u0391-\u03A9\u03B1-\u03C9]/.test(name)) {
                    context.report({
                        node,
                        message: 'Identifiers with Cyrillic or Greek characters are forbidden',
                    });
                }
            },
        };
    },
};
// eslint-disable-next-line import/no-default-export
export default rule;
//# sourceMappingURL=dangerous-identifiers.js.map