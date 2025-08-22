const unicodePatterns = {
    // Trojan Source (Bidirectional Overrides)
    trojanSource: /[\u202A-\u202E\u2066-\u2069]/,
    // Unicode Hyphens/Dashes (including U+2011)
    unicodeHyphens: /[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D]/,
    // Cyrillic Homographs
    cyrillicHomographs: /[\u0430-\u044F\u0451]/,
    // Greek Homographs
    greekHomographs: /[\u0391-\u03A9\u03B1-\u03C9]/,
    // Mathematical Alphanumeric
    mathSymbols: /[\uD835]/,
    // Fullwidth ASCII
    fullwidthAscii: /[\uFF01-\uFF5E]/,
    // Zero-width/Invisible characters
    zeroWidth: /[\u00AD\u061C\u180E\u200B-\u200F\u2028\u2029\u202F\u2060-\u2064\uFEFF]/,
    // Unicode Quotes
    unicodeQuotes: /[\u2018-\u201F\u2039\u203A]/,
};
const rule = {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Disallow dangerous Unicode characters in string literals',
            category: 'Best Practices',
            recommended: true,
        },
        fixable: undefined,
        schema: [],
        messages: {
            dangerousUnicodeLiteral: 'String literal contains dangerous Unicode characters. Use ASCII only.',
            invisibleCharacters: 'Invisible, surrogate, private-use or non-characters are not allowed',
            trojanSource: 'Bidirectional text controls are forbidden (Trojan Source protection)',
            unicodeHyphens: 'Unicode hyphens/dashes not allowed. Use ASCII hyphen (-) instead',
            cyrillicHomographs: 'Cyrillic characters that look like Latin letters are forbidden',
            greekHomographs: 'Greek characters that look like Latin letters are forbidden',
            mathSymbols: 'Mathematical alphanumeric symbols that mimic normal letters are forbidden',
            fullwidthAscii: 'Fullwidth ASCII variants are forbidden. Use regular ASCII characters',
            zeroWidth: 'Zero-width and invisible formatting characters are forbidden',
            unicodeQuotes: 'Unicode quotation marks are forbidden. Use ASCII quotes (\' or ") instead',
        },
    },
    create(context) {
        return {
            Literal(node) {
                if (typeof node.value !== 'string') {
                    return;
                }
                const value = node.value;
                // 1. Invisible, surrogate, private-use or non-characters
                if (/[\u00AD\u061C\u180E\u200B-\u200F\u2028\u2029\u202F\u2060-\u2064\uFEFF]/.test(value)) {
                    context.report({
                        node,
                        message: 'Invisible, surrogate, private-use or non-characters are not allowed',
                    });
                    return;
                }
                // 2. Trojan Source (Bidirectional Overrides)
                if (unicodePatterns.trojanSource.test(value)) {
                    context.report({
                        node,
                        message: 'Bidirectional text controls are forbidden (Trojan Source protection)',
                    });
                    return;
                }
                // 3. Unicode Hyphens/Dashes
                if (unicodePatterns.unicodeHyphens.test(value)) {
                    context.report({
                        node,
                        message: 'Unicode hyphens/dashes not allowed. Use ASCII hyphen (-) instead',
                    });
                    return;
                }
                // 4. Cyrillic Homographs
                if (/[\u0430\u043E\u0440\u0435\u0443\u0445\u0441\u0440\u043A\u043D\u043C\u0442\u0438\u043B\u0432\u0434\u0444\u0433\u0436\u0449\u0448\u044C\u044B\u044A\u044D\u044E\u044F\u0451]/.test(value)) {
                    context.report({
                        node,
                        message: 'Cyrillic characters that look like Latin letters are forbidden',
                    });
                    return;
                }
                // 5. Greek Homographs
                if (/[\u03B1\u03B5\u03B9\u03BA\u03BD\u03BF\u03C1\u03C4\u03C5\u03C7\u0391\u0392\u0395\u0396\u0397\u0399\u039A\u039C\u039D\u039F\u03A1\u03A4\u03A5\u03A7]/.test(value)) {
                    context.report({
                        node,
                        message: 'Greek characters that look like Latin letters are forbidden',
                    });
                    return;
                }
                // 6. Mathematical Alphanumeric
                if (/[\uD835][\uDC00-\uDFFF]/.test(value)) {
                    context.report({
                        node,
                        message: 'Mathematical alphanumeric symbols that mimic normal letters are forbidden',
                    });
                    return;
                }
                // 7. Fullwidth ASCII
                if (unicodePatterns.fullwidthAscii.test(value)) {
                    context.report({
                        node,
                        message: 'Fullwidth ASCII variants are forbidden. Use regular ASCII characters',
                    });
                    return;
                }
                // 8. Zero-width/Invisible characters
                if (unicodePatterns.zeroWidth.test(value)) {
                    context.report({
                        node,
                        message: 'Zero-width and invisible formatting characters are forbidden',
                    });
                    return;
                }
                // 9. Unicode Quotes
                if (unicodePatterns.unicodeQuotes.test(value)) {
                    context.report({
                        node,
                        message: 'Unicode quotation marks are forbidden. Use ASCII quotes (\' or ") instead',
                    });
                    return;
                }
            },
        };
    },
};
// eslint-disable-next-line import/no-default-export
export default rule;
//# sourceMappingURL=dangerous-literals.js.map