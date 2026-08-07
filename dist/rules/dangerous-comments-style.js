"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const unicode_mapping_1 = require("../utils/unicode-mapping");
const dangerousPattern = new RegExp([
    /[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D]/.source, // Unicode Hyphens
    /[\u2018-\u201F\u2039\u203A]/.source, // Unicode Quotes
    /[\u00A0\u2026\u2007\u2009\u2022]/.source, // Typographic artifacts (NBSP, ellipsis, thin/figure space, bullet)
].join('|'));
const replacements = Object.entries(unicode_mapping_1.unicodeToAsciiMap).map(([unicode, ascii]) => [new RegExp(unicode, 'g'), ascii]);
const rule = {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Disallow typographic Unicode artifacts in comments that are common tells of unedited AI-generated text',
            recommended: true,
        },
        fixable: 'code',
        schema: [],
        messages: {
            dangerousUnicodeStyle: 'Comment contains typographic Unicode artifacts commonly produced by AI text generation. Use plain ASCII.',
        },
    },
    create(context) {
        return {
            Program() {
                const sourceCode = context.sourceCode;
                const comments = sourceCode.getAllComments();
                comments.forEach((comment) => {
                    if (dangerousPattern.test(comment.value)) {
                        let fixedValue = comment.value;
                        replacements.forEach(([pattern, ascii]) => {
                            fixedValue = fixedValue.replace(pattern, ascii);
                        });
                        const hasFix = fixedValue !== comment.value;
                        context.report({
                            loc: comment.loc,
                            message: 'Comment contains typographic Unicode artifacts commonly produced by AI text generation. Use plain ASCII.',
                            fix: hasFix
                                ? (fixer) => {
                                    const commentType = comment.type === 'Block' ? '/*' : '//';
                                    const commentEnd = comment.type === 'Block' ? '*/' : '';
                                    const newComment = `${commentType}${fixedValue}${commentEnd}`;
                                    return fixer.replaceTextRange(comment.range, newComment);
                                }
                                : null,
                        });
                    }
                });
            },
        };
    },
};
exports.default = rule;
//# sourceMappingURL=dangerous-comments-style.js.map