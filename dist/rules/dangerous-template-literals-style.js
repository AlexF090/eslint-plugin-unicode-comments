"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dangerousPattern = new RegExp([
    /[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D]/.source, // Unicode Hyphens
    /[\u2018-\u201F\u2039\u203A]/.source, // Unicode Quotes
    /[\u00A0\u2026\u2007\u2009\u2022]/.source, // Typographic artifacts (NBSP, ellipsis, thin/figure space, bullet)
].join('|'));
const rule = {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Disallow typographic Unicode artifacts in template literals that are common tells of unedited AI-generated text',
            recommended: true,
        },
        fixable: undefined,
        schema: [],
        messages: {
            dangerousUnicodeTemplateLiteralStyle: 'Template literal contains typographic Unicode artifacts. Use ASCII only.',
        },
    },
    create(context) {
        return {
            TemplateLiteral(node) {
                for (const quasi of node.quasis) {
                    const text = quasi.value.raw;
                    if (dangerousPattern.test(text)) {
                        context.report({
                            node,
                            message: 'Template literal contains typographic Unicode artifacts. Use ASCII only.',
                        });
                        return;
                    }
                }
            },
        };
    },
};
exports.default = rule;
//# sourceMappingURL=dangerous-template-literals-style.js.map