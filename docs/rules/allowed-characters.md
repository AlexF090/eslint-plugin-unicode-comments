# allowed-characters

Allow only listed non-ASCII characters per source context.

- Recommended: `error` (ASCII-only code and identifiers, any visible character elsewhere)
- Strict: `error` with ASCII only everywhere

## Rule details

ASCII is always allowed. Every other character that no other rule of this plugin reports (invisible, bidirectional, confusable, whitespace, and typographic characters are handled by their own rules) must match the allow list of its source context:

| Context      | Covers                                                                                                 |
| ------------ | ------------------------------------------------------------------------------------------------------ |
| `code`       | syntax outside the other contexts: operators, whitespace between tokens, CSS selectors, YAML structure |
| `identifier` | JavaScript identifiers and keywords, TOML bare keys                                                    |
| `comment`    | comments in every language                                                                             |
| `string`     | string, template, and regular expression literals; JSON strings and keys; YAML and TOML values         |
| `text`       | Markdown, HTML text, JSX text, and plain text files                                                    |

Default options (the `recommended` policy):

```json
{
  "code": [],
  "identifier": [],
  "comment": ["\\p{L}", "\\p{M}", "\\p{N}", "\\p{P}", "\\p{S}"],
  "string": ["\\p{L}", "\\p{M}", "\\p{N}", "\\p{P}", "\\p{S}"],
  "text": ["\\p{L}", "\\p{M}", "\\p{N}", "\\p{P}", "\\p{S}"]
}
```

Examples of **incorrect** code with the default options (`<U+00F6>` stands for LATIN SMALL LETTER O WITH DIAERESIS):

```js
const gr<U+00F6>sse = 1;
```

Examples of **correct** code with the default options:

```js
const greeting = 'Gr<U+00FC><U+00DF>e'; // letters are allowed in strings
```

## Options

Each key replaces the default list for that context; keys you leave out keep their default. Entries use the format described in [no-bidi-control](./no-bidi-control.md#options).

Allow German letters in comments under the strict policy:

```js
import unicodeGuard from 'eslint-plugin-unicode-guard';

export default [
  unicodeGuard.configs.strict,
  {
    rules: {
      'unicode-guard/allowed-characters': [
        'error',
        { comment: ['\\p{Script=Latin}'], string: [], text: [] },
      ],
    },
  },
];
```

Allow Latin letters in identifiers:

```json
{ "identifier": ["\\p{Script=Latin}"] }
```
