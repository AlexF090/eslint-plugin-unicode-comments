"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const unicodePatterns = {
    // Unicode Hyphens/Dashes (including U+2011)
    unicodeHyphens: /[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D]/,
    // Unicode Quotes
    unicodeQuotes: /[\u2018-\u201F\u2039\u203A]/,
    // Typographic artifacts (NBSP, ellipsis, thin/figure space, bullet) - common AI-generated text tells
    typographicArtifacts: /[\u00A0\u2026\u2007\u2009\u2022]/,
};
const rule = {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Disallow typographic Unicode artifacts in string literals that are common tells of unedited AI-generated text',
            recommended: true,
        },
        fixable: undefined,
        schema: [],
        messages: {
            dangerousUnicodeLiteralStyle: 'String literal contains typographic Unicode artifacts. Use ASCII only.',
            unicodeHyphens: 'Unicode hyphens/dashes not allowed. Use ASCII hyphen (-) instead',
            unicodeQuotes: 'Unicode quotation marks are forbidden. Use ASCII quotes (\' or ") instead',
            typographicArtifacts: 'Non-breaking space, thin/figure space, bullet or ellipsis character detected. Use a regular space, hyphen or three dots (...) instead',
        },
    },
    create(context) {
        return {
            Literal(node) {
                if (typeof node.value !== 'string') {
                    return;
                }
                const value = node.value;
                // 1. Unicode Hyphens/Dashes
                if (unicodePatterns.unicodeHyphens.test(value)) {
                    context.report({
                        node,
                        message: 'Unicode hyphens/dashes not allowed. Use ASCII hyphen (-) instead',
                    });
                    return;
                }
                // 2. Unicode Quotes
                if (unicodePatterns.unicodeQuotes.test(value)) {
                    context.report({
                        node,
                        message: 'Unicode quotation marks are forbidden. Use ASCII quotes (\' or ") instead',
                    });
                    return;
                }
                // 3. Typographic artifacts (NBSP, ellipsis, thin/figure space, bullet)
                if (unicodePatterns.typographicArtifacts.test(value)) {
                    context.report({
                        node,
                        message: 'Non-breaking space, thin/figure space, bullet or ellipsis character detected. Use a regular space, hyphen or three dots (...) instead',
                    });
                    return;
                }
            },
        };
    },
};
exports.default = rule;
//# sourceMappingURL=dangerous-literals-style.js.map