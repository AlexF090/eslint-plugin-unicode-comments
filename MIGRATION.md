# Migrating from eslint-plugin-unicode-comments

`eslint-plugin-unicode-guard` 1.0.0 replaces `eslint-plugin-unicode-comments` 2.x. The old package is deprecated and receives no further releases.

## Requirements

- ESLint `^9.38.0 || ^10.0.0`. ESLint 8 and `.eslintrc` are no longer supported; stay on `eslint-plugin-unicode-comments` if you cannot upgrade.
- Node.js `^22.13.0 || >=24`.
- The package is ESM only. CommonJS configuration files can still `require()` it on the supported Node.js versions.

## Configuration

```diff
- const unicodeComments = require('eslint-plugin-unicode-comments');
- module.exports = [unicodeComments.configs['flat/recommended']];
+ import unicodeGuard from 'eslint-plugin-unicode-guard';
+ export default [unicodeGuard.configs.recommended];
```

## Rules

The old rules were split by node type (comment, literal, template literal, identifier). The new rules are split by kind of character and check every context, including whitespace between tokens, regular expressions, JSX, and non-JavaScript files.

| Old rule (`unicode-comments/...`)                                                                          | New rules (`unicode-guard/...`)                                                                   |
| ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `dangerous-unicode`, `dangerous-unicode-security`                                                          | `no-bidi-control`, `no-invisible-characters`, `no-confusable-characters`, `no-unusual-whitespace` |
| `dangerous-unicode-literals`, `dangerous-unicode-literals-security`                                        | same as above                                                                                     |
| `dangerous-unicode-template-literals`, `dangerous-unicode-template-literals-security`                      | same as above                                                                                     |
| `dangerous-unicode-identifiers`                                                                            | `no-confusable-characters`, `allowed-characters` (identifiers are ASCII only by default)          |
| `dangerous-unicode-style`, `dangerous-unicode-literals-style`, `dangerous-unicode-template-literals-style` | `no-typographic-characters`, `no-unusual-whitespace`                                              |

Replace disable comments accordingly, for example:

```diff
- // eslint-disable-next-line unicode-comments/dangerous-unicode-style
+ // eslint-disable-next-line unicode-guard/no-typographic-characters
```

## Behavior changes

- Escape sequences such as `"\u202E"` are no longer reported. Only characters that are actually present in the source text are.
- Each problem points to the exact character and names it (`U+200B ZERO WIDTH SPACE`) instead of marking the whole comment or literal.
- No-break, thin, and figure spaces moved from the style rules (`warn`) to `no-unusual-whitespace` (`error`), because they change string values invisibly.
- `eslint --fix` only replaces unusual whitespace between JavaScript and TypeScript tokens, and no rule offers editor suggestions. Every other finding names its ASCII replacement in the message; replace it by hand, because an automatic or suggested change can turn a comment into a directive (`eslint-disable`, `@ts-ignore`), end a comment or string, or complete Markdown or HTML markup.
- Single angle quotation marks are replaced with `'` instead of `<` and `>`. Low-9 quotation marks are replaced with `'` and `"` instead of `,` and `,,`.
- Words written entirely in Cyrillic or Greek are no longer reported in comments and strings under `recommended`; only words that mix scripts are. The old rules reported every Cyrillic and Greek letter. Use the `strict` preset or a narrower `allowed-characters` policy to keep that behavior.
- Line separator, paragraph separator, and narrow no-break space (U+2028, U+2029, U+202F), which the old security rules reported, are now reported by `no-unusual-whitespace`.
- Latin letters that imitate ASCII, such as the dotless i (U+0131), are reported by `no-confusable-characters`. Allow them with its `allow` option if you write Turkish or Azerbaijani.
- Many more characters are reported: tag characters, variation selectors, private-use characters, control characters, Hangul fillers, all Unicode spaces, uppercase Cyrillic and Greek homoglyphs, and any non-ASCII identifier.
