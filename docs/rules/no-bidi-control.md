# no-bidi-control

Disallow bidirectional control characters, which make source code display in a different order than it is executed.

- Recommended: `error`
- Suggestions: remove the character, when the characters on both sides are ASCII letters, digits, spaces, or tabs (removing it elsewhere could join two characters into syntax, such as `$` and `{`)

## Rule details

Bidirectional (bidi) control characters change the visual order of the text around them. In source code they let an attacker show reviewers one program while the compiler or interpreter runs another. This is the Trojan Source attack ([CVE-2021-42574](https://trojansource.codes/)).

The rule reports every character with the Unicode property `Bidi_Control`, in every context and every language:

| Code point      | Name                                              |
| --------------- | ------------------------------------------------- |
| U+061C          | ARABIC LETTER MARK                                |
| U+200E, U+200F  | LEFT-TO-RIGHT MARK, RIGHT-TO-LEFT MARK            |
| U+202A - U+202E | embeddings, overrides, POP DIRECTIONAL FORMATTING |
| U+2066 - U+2069 | isolates, POP DIRECTIONAL ISOLATE                 |

Adjacent characters are reported as one problem. Escape sequences such as `"\u202E"` are visible in the source and are not reported.

Examples of **incorrect** code (`<U+202E>` stands for the invisible character):

```js
/*<U+202E> } <U+2066>if (isAdmin)<U+2069> <U+2066> begin admins only */
const accessLevel = 'user<U+202E> <U+2066>// Check if admin<U+2069> <U+2066>';
```

Examples of **correct** code:

```js
const rightToLeftOverride = '\u202E';
```

## Options

```json
{ "allow": ["U+200F"] }
```

`allow` takes literal characters, `U+XXXX` code points, `U+XXXX..U+YYYY` ranges, or Unicode property escapes such as `\\p{Script=Hebrew}`. Allowing the directional marks (U+200E, U+200F, U+061C) can make sense for right-to-left prose in Markdown. Never allow overrides or isolates.

## When not to use it

Do not disable this rule. If a file legitimately needs right-to-left text, write the controls as escape sequences.
