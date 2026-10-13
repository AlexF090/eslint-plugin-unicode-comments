# eslint-plugin-unicode-guard

ESLint plugin that keeps hidden and deceptive Unicode out of your repository, so AI-generated code and AI instruction files are safe to review and merge.

Code review is visual. A reviewer cannot see a zero width space, a bidirectional override, a Cyrillic `a` in a Latin identifier, or an instruction encoded in invisible tag characters. Language models produce these characters by accident, and attackers plant them on purpose: Trojan Source, invisible backdoors, GlassWorm payloads, and the "Rules File Backdoor" all rely on characters a developer would never type. This plugin reports every one of them, with the exact position, the code point, and its name.

- **Every character, every file type.** Rules scan the raw source text, not selected AST nodes, so there are no blind spots. Works with JavaScript, TypeScript, JSX, JSON, Markdown, CSS, YAML, TOML, HTML, and any other file through the bundled plain text language.
- **Allowlist instead of denylist.** Characters are classified by Unicode properties, so new attack characters are covered without a plugin update. Code and identifiers are ASCII only by default; comments, strings, and prose may contain any visible character in any script.
- **Few false positives.** Emoji ZWJ sequences, variation selectors after emoji, subdivision flags, and joiners in Arabic or Indic text are recognised as legitimate.
- **Readable reports.** `Invisible tag characters in a comment encode the hidden text "Ignore all previous instructions" (ASCII smuggling).`
- **Fixes where safe.** Typographic characters and unusual whitespace are fixed automatically in comments and Markdown prose (whitespace also between tokens). In strings, code blocks, rendered JSX or HTML text, and plain text files, a suggestion is offered instead, because a fix could change a value or break code.

## Installation

```sh
npm install --save-dev eslint eslint-plugin-unicode-guard
```

Requires ESLint `^9.38.0 || ^10.0.0` with flat configuration, and Node.js `^22.13.0 || >=24`.

## Usage

```js
// eslint.config.js
import { defineConfig } from 'eslint/config';
import unicodeGuard from 'eslint-plugin-unicode-guard';

export default defineConfig([
  unicodeGuard.configs.recommended,
  unicodeGuard.configs['ai-instructions'],
]);
```

`recommended` applies to the files your configuration already lints (JavaScript and TypeScript by default). `ai-instructions` lints instruction files for AI coding assistants with the strict policy (see below).

### Other languages

The rules do not depend on a parser. Add them to every language you lint:

```js
import css from '@eslint/css';
import json from '@eslint/json';
import markdown from '@eslint/markdown';
import { defineConfig } from 'eslint/config';
import toml from 'eslint-plugin-toml';
import unicodeGuard from 'eslint-plugin-unicode-guard';
import yml from 'eslint-plugin-yml';

export default defineConfig([
  unicodeGuard.configs.recommended,
  {
    files: ['**/*.json'],
    plugins: { json },
    language: 'json/json',
    extends: [unicodeGuard.configs.recommended],
  },
  {
    files: ['**/*.md'],
    plugins: { markdown },
    language: 'markdown/gfm',
    extends: [unicodeGuard.configs.recommended],
  },
  {
    files: ['**/*.css'],
    plugins: { css },
    language: 'css/css',
    extends: [unicodeGuard.configs.recommended],
  },
  {
    files: ['**/*.{yml,yaml}'],
    plugins: { yml },
    language: 'yml/yaml',
    extends: [unicodeGuard.configs.recommended],
  },
  {
    files: ['**/*.toml'],
    plugins: { toml },
    language: 'toml/toml',
    extends: [unicodeGuard.configs.recommended],
  },
  // Anything without an ESLint parser: shell scripts, Python, Dockerfiles, .env files, ...
  {
    files: ['**/*.{sh,py,txt}', '**/Dockerfile', '**/.env*'],
    language: 'unicode-guard/text',
    extends: [unicodeGuard.configs.recommended],
  },
  unicodeGuard.configs['ai-instructions'],
]);
```

HTML works the same way with `@html-eslint/eslint-plugin` and `language: 'html/html'`.

## Presets

| Preset            | For                                                                                                                                             | Policy                                                                                                                                    |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `recommended`     | most projects                                                                                                                                   | security rules `error`; ASCII-only code and identifiers; any visible character in comments, strings, prose; typographic characters `warn` |
| `strict`          | security-critical repositories                                                                                                                  | like `recommended`, but ASCII only everywhere and typographic characters `error`                                                          |
| `relaxed`         | adopting the plugin in a large existing codebase                                                                                                | only bidirectional, invisible, private-use, and confusable characters `error`; unusual whitespace `warn`                                  |
| `ai-instructions` | `AGENTS.md`, `CLAUDE.md`, `.cursorrules`, `.cursor/rules/**`, `*.mdc`, `.github/copilot-instructions.md`, and other assistant instruction files | `strict`, linted as plain text                                                                                                            |

## Rules

| Rule                                                                                             | Reports                                                                                                         | Recommended | Fix        |
| ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- | ----------- | ---------- |
| [no-bidi-control](docs/rules/no-bidi-control.md)                                                 | bidirectional controls (Trojan Source)                                                                          | error       | suggestion |
| [no-invisible-characters](docs/rules/no-invisible-characters.md)                                 | zero-width and format characters, Hangul fillers, tag characters, stray variation selectors, control characters | error       | suggestion |
| [no-private-use-or-unassigned-characters](docs/rules/no-private-use-or-unassigned-characters.md) | private-use characters, unassigned code points, noncharacters, unpaired surrogates                              | error       |            |
| [no-confusable-characters](docs/rules/no-confusable-characters.md)                               | ASCII lookalikes and mixed-script words (homographs)                                                            | error       | suggestion |
| [no-unusual-whitespace](docs/rules/no-unusual-whitespace.md)                                     | no-break, thin, ideographic, and other non-ASCII whitespace                                                     | error       | autofix    |
| [no-typographic-characters](docs/rules/no-typographic-characters.md)                             | dashes, curly quotes, ellipsis, bullets, arrows                                                                 | warn        | autofix    |
| [allowed-characters](docs/rules/allowed-characters.md)                                           | any other non-ASCII character not allowed in its context                                                        | error       |            |

Every character is reported by exactly one rule, so a finding never appears twice.

## Configuring the allow lists

All rules accept an `allow` option; `allowed-characters` takes one list per source context. Entries are literal characters, code points (`U+00E4`), ranges (`U+0400..U+04FF`), or Unicode property escapes (`\\p{Script=Latin}`).

Permit Latin letters in identifiers, for a codebase with German or French names:

```js
{
  rules: {
    'unicode-guard/allowed-characters': ['error', { identifier: ['\\p{Script=Latin}'] }],
  },
}
```

Use the strict policy but allow German umlauts in Markdown:

```js
{
  files: ['**/*.md'],
  rules: {
    'unicode-guard/allowed-characters': ['error', { text: ['U+00C4', 'U+00D6', 'U+00DC', 'U+00E4', 'U+00F6', 'U+00FC', 'U+00DF'] }],
  },
}
```

Checks are based on Unicode scripts, not natural languages: German, French, and Spanish are all `Script=Latin`.

## How it works

1. A language adapter maps the file to source contexts (code, identifier, comment, string, text) using the tokens and nodes of the active ESLint language.
2. A scanner visits every character outside printable ASCII and assigns it exactly one category from its Unicode properties: bidi control, invisible, control, private use, unassigned, surrogate, unusual whitespace, typographic, lookalike, mixed script, or other.
3. Each rule reports its own categories, grouped into runs, with exact line and column.

The scanner has no ESLint dependency. Design decisions are recorded in [docs/adr](docs/adr).

## Migrating from eslint-plugin-unicode-comments

This package replaces `eslint-plugin-unicode-comments`. See [MIGRATION.md](MIGRATION.md).

## Security

See [SECURITY.md](SECURITY.md) for reporting vulnerabilities, including characters or sequences the plugin misses.

## License

[MIT](LICENSE)
