"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const unicode_mapping_1 = require("../utils/unicode-mapping");
const dangerousPattern = new RegExp([
    /[\u202A-\u202E\u2066-\u2069]/.source, // Trojan Source
    /[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D]/.source, // Unicode Hyphens
    /[\u0430\u043E\u0440\u0435\u0443\u0445\u0441\u0440\u043A\u043D\u043C\u0442\u0438\u043B\u0432\u0434\u0444\u0433\u0436\u0449\u0448\u044C\u044B\u044A\u044D\u044E\u044F\u0451]/
        .source, // Cyrillic Homographs
    /[\u03B1\u03B5\u03B9\u03BA\u03BD\u03BF\u03C1\u03C4\u03C5\u03C7\u0391\u0392\u0395\u0396\u0397\u0399\u039A\u039C\u039D\u039F\u03A1\u03A4\u03A5\u03A7]/
        .source, // Greek Homographs
    /[\uD835][\uDC00-\uDFFF]/.source, // Mathematical Alphanumeric
    /[\uFF01-\uFF5E]/.source, // Fullwidth ASCII
    /[\u00AD\u061C\u180E\u200B-\u200F\u2028\u2029\u202F\u2060-\u2064\uFEFF]/
        .source, // Zero-width/Invisible
    /[\u2018-\u201F\u2039\u203A]/.source, // Unicode Quotes
    /[\u00A0\u2026]/.source, // Typographic artifacts (NBSP, ellipsis)
].join('|'));
const rule = {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Disallow dangerous Unicode characters in comments',
            recommended: true,
        },
        fixable: 'code',
        schema: [],
        messages: {
            dangerousUnicode: 'Comment contains dangerous Unicode characters. Use ASCII only.',
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
                        // Ersetze alle gefährlichen Unicode-Zeichen
                        Object.keys(unicode_mapping_1.unicodeToAsciiMap).forEach((unicode) => {
                            const asciiValue = unicode_mapping_1.unicodeToAsciiMap[unicode];
                            fixedValue = fixedValue.replace(new RegExp(unicode, 'g'), asciiValue);
                        });
                        const hasFix = fixedValue !== comment.value;
                        context.report({
                            loc: comment.loc,
                            message: 'Comment contains dangerous Unicode characters. Use ASCII only.',
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
//# sourceMappingURL=dangerous-comments.js.map