# no-unusual-whitespace

Disallow whitespace other than space, tab, and line breaks.

- Recommended: `error`
- Fixable: replaces the character with a space (or a line feed for LINE SEPARATOR and PARAGRAPH SEPARATOR) in code, comments, and Markdown prose. Strings, Markdown code blocks and inline code, JSX and HTML text, embedded scripts and styles, and files linted with `unicode-guard/text` get a suggestion instead, because a fix there could change a value, rendered text, or code.

## Rule details

The rule reports `\p{Zs}` characters other than U+0020 SPACE, plus U+2028 LINE SEPARATOR and U+2029 PARAGRAPH SEPARATOR. Typical sources are copied text from word processors, chat tools, and language models: NO-BREAK SPACE (U+00A0), NARROW NO-BREAK SPACE (U+202F), THIN SPACE (U+2009), FIGURE SPACE (U+2007), and IDEOGRAPHIC SPACE (U+3000).

Unlike the core rule [`no-irregular-whitespace`](https://eslint.org/docs/latest/rules/no-irregular-whitespace), this rule also checks comments, strings, templates, regular expressions, and non-JavaScript files, because a no-break space inside a string is a bug that is invisible in review.

Examples of **incorrect** code (`<U+00A0>` stands for NO-BREAK SPACE):

```js
const total =<U+00A0>price * quantity;
const unit = '10<U+00A0>km'; // not equal to '10 km'
```

Examples of **correct** code:

```js
const unit = '10 km';
```

## Options

```json
{ "allow": ["U+3000"] }
```

Allow IDEOGRAPHIC SPACE for Chinese or Japanese prose. See [no-bidi-control](./no-bidi-control.md#options) for the entry format.
