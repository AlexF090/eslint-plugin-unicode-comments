"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rule = {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Disallow dangerous Unicode characters in identifiers',
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
                // Cyrillic and Greek homograph characters in identifiers
                if (/[\u0430\u043E\u0440\u0435\u0443\u0445\u0441\u043A\u043D\u043C\u0442\u0438\u043B\u0432\u0434\u0444\u0433\u0436\u0449\u0448\u044C\u044B\u044A\u044D\u044E\u044F\u0451\u03B1\u03B5\u03B9\u03BA\u03BD\u03BF\u03C1\u03C4\u03C5\u03C7\u0391\u0392\u0395\u0396\u0397\u0399\u039A\u039C\u039D\u039F\u03A1\u03A4\u03A5\u03A7]/.test(name)) {
                    context.report({
                        node,
                        message: 'Identifiers with Cyrillic or Greek characters are forbidden',
                    });
                }
            },
        };
    },
};
exports.default = rule;
//# sourceMappingURL=dangerous-identifiers.js.map