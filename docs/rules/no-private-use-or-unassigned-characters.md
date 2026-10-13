# no-private-use-or-unassigned-characters

Disallow private-use characters, unassigned code points, noncharacters, and unpaired surrogates.

- Recommended: `error`

## Rule details

These characters have no standard appearance. Private-use characters (`\p{Co}`) render as whatever the installed font defines, often an icon or an empty box. Unassigned code points and noncharacters (`\p{Cn}`) render as boxes or not at all. An unpaired surrogate means the text is not well-formed Unicode, which some tools reject and others silently replace.

Whether a code point counts as unassigned depends on the Unicode version of the Node.js engine that runs ESLint. A character added in a newer Unicode version can be reported on an older Node.js release.

Examples of **incorrect** code (`<U+E0A0>` stands for the private-use character):

```js
const branchIcon = '<U+E0A0>';
```

Examples of **correct** code:

```js
const branchIcon = '\uE0A0';
```

## Options

```json
{ "allow": ["U+E000..U+F8FF"] }
```

Allow the private use area if the project relies on an icon font such as Nerd Fonts. See [no-bidi-control](./no-bidi-control.md#options) for the entry format.
