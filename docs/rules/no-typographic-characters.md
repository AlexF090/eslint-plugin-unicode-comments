# no-typographic-characters

Disallow typographic characters that word processors and language models insert where a developer types ASCII.

- Recommended: `warn`, strict: `error`
- Fixable: in Markdown prose. Comments get a suggestion instead, because tools read them: a fixed dash turns `eslint<U+2010>disable` or `@ts<U+2013>ignore` into a live directive, and a fixed shebang changes the command that runs a file. Strings, Markdown code blocks, inline code, and link targets, JSX and HTML text, embedded scripts and styles, and files linted with `unicode-guard/text` get a suggestion instead, because a fix there could change a value, rendered text, or code. In Markdown, prose in a block (text between blank lines) that contains `<`, `[`, or `]`, and a word that contains `@`, `:`, or `www`, only get suggestions: a fixed quote or space there could complete inline HTML, a link title, or a link reference definition, and a fixed dash could create an email or web autolink or change its target. Characters in code and identifiers get neither.

## Rule details

These characters are not dangerous, but they are a reliable sign of unedited generated text, and they break copy and paste into terminals and configuration files.

| Characters                                                             | Replacement                     |
| ---------------------------------------------------------------------- | ------------------------------- |
| HYPHEN, NON-BREAKING HYPHEN, FIGURE DASH, EN DASH, MINUS SIGN          | `-`                             |
| EM DASH, HORIZONTAL BAR, SMALL EM DASH                                 | `--`                            |
| curly, low-9, reversed, and angle single quotation marks, PRIME        | `'`                             |
| curly, low-9, reversed, and angle double quotation marks, DOUBLE PRIME | `"`                             |
| HORIZONTAL ELLIPSIS                                                    | `...`                           |
| BULLET, TRIANGULAR BULLET, HYPHEN BULLET                               | `-`                             |
| arrows (U+2190, U+2192, U+2194, U+21D0, U+21D2, U+21D4)                | `<-` `->` `<->` `<=` `=>` `<=>` |
| NOT EQUAL TO, LESS-THAN OR EQUAL TO, GREATER-THAN OR EQUAL TO          | `!=` `<=` `>=`                  |
| MULTIPLICATION SIGN                                                    | `x`                             |

Examples of **incorrect** code (`<U+2014>` stands for EM DASH, `<U+2192>` for RIGHTWARDS ARROW):

```js
// Returns the user <U+2014> or null <U+2192> caller handles it
```

Examples of **correct** code:

```js
// Returns the user -- or null -> caller handles it
```

## Options

```json
{ "allow": ["U+2192"] }
```

See [no-bidi-control](./no-bidi-control.md#options) for the entry format.

## When not to use it

Turn the rule off for files that are typeset prose, such as a translated user-facing documentation site.
