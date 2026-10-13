# eslint-plugin-unicode-guard

[![npm version](https://img.shields.io/npm/v/eslint-plugin-unicode-guard)](https://www.npmjs.com/package/eslint-plugin-unicode-guard)
[![CI](https://github.com/AlexF090/eslint-plugin-unicode-guard/actions/workflows/ci.yml/badge.svg)](https://github.com/AlexF090/eslint-plugin-unicode-guard/actions/workflows/ci.yml)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

ESLint plugin that keeps hidden and deceptive Unicode out of your repository, so AI-generated code and AI instruction files are safe to review and merge.

Code review is visual. A reviewer cannot see a zero width space, a bidirectional override, a Cyrillic `a` in a Latin identifier, or an instruction encoded in invisible tag characters. Language models produce these characters by accident, and attackers plant them on purpose: Trojan Source, invisible backdoors, GlassWorm payloads, and the "Rules File Backdoor" all rely on characters a developer would never type. This plugin reports every one of them, with the exact position, the code point, and its name.

- **Every character, every file type.** Rules scan the raw source text, not selected AST nodes, so there are no blind spots. Works with JavaScript, TypeScript, JSX, JSON, Markdown, CSS, YAML, TOML, HTML, and any other file through the bundled plain text language.
- **Allowlist instead of denylist.** Characters are classified by Unicode properties, so new attack characters are covered without a plugin update. Code and identifiers are ASCII only by default; comments, strings, and prose may contain any visible character in any script.
- **Few false positives.** Emoji ZWJ sequences, variation selectors after emoji, subdivision flags, and joiners in Arabic or Indic text are recognised as legitimate.
- **Readable reports.** `Invisible tag characters in a comment encode the hidden text "Ignore all previous instructions" (ASCII smuggling).`
- **Fixes only where provably safe.** `--fix` replaces unusual whitespace between JavaScript and TypeScript tokens, where the language already treats it as whitespace. Nothing else is fixed or suggested: messages name the ASCII replacement, and you apply it by hand. Any automatic or suggested change can turn a comment, string, or text into live code or markup: a dash before `>` ends an HTML comment, a comma splits a YAML list, and even letters form directives (`eslint-disable`), tags (`<script>`), and keywords.

## Example output

Given a JavaScript file with a Cyrillic `a` in a URL and a zero width space in a comment, and a `CLAUDE.md` with an instruction hidden in tag characters, ESLint reports:

```text
CLAUDE.md
  3:20  error  Invisible tag characters in text encode the hidden text "Ignore all previous instructions" (ASCII smuggling)  unicode-guard/no-invisible-characters

login.js
  1:23  error  Cyrillic character U+0430 ("<U+0430>") in a Latin word in a string. Mixing scripts within one word is the shape of a homograph attack  unicode-guard/no-confusable-characters
  2:18  error  Invisible character U+200B ZERO WIDTH SPACE in a comment. Invisible characters can hide code or instructions from reviewers     unicode-guard/no-invisible-characters

<U+2716> 3 problems (3 errors, 0 warnings)
```

(The glyphs in this output are written as `<U+XXXX>` placeholders.)

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
    languageOptions: { frontmatter: 'yaml' },
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

| Preset            | For                                                                                                                                                                                                                       | Policy                                                                                                                                    |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `recommended`     | most projects                                                                                                                                                                                                             | security rules `error`; ASCII-only code and identifiers; any visible character in comments, strings, prose; typographic characters `warn` |
| `strict`          | security-critical repositories                                                                                                                                                                                            | like `recommended`, but ASCII only everywhere and typographic characters `error`                                                          |
| `relaxed`         | adopting the plugin in a large existing codebase                                                                                                                                                                          | only bidirectional, invisible, private-use, and confusable characters `error`; unusual whitespace `warn`                                  |
| `ai-instructions` | `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `SKILL.md`, `.cursorrules`, `.cursor/rules/**`, `*.mdc`, `.github/copilot-instructions.md`, `.github/agents/**`, and other assistant instruction files, matched case-insensitively | `strict`, linted as plain text, inline configuration comments ignored                                                                     |

`ai-instructions` sets `linterOptions: { noInlineConfig: true }` for its files: a comment such as `<!-- eslint-disable -->` is invisible in rendered Markdown, so an injected one could switch off every check unnoticed. Place the preset after your other configuration objects so its plain text language applies, and if a later object sets `linterOptions` for the same files, keep `noInlineConfig: true` there. The full file list is `aiInstructionFilePatterns` in [`src/presets.ts`](src/presets.ts).

## Rules

| Rule                                                                                             | Reports                                                                                                         | Recommended | Fix    |
| ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- | ----------- | ------ |
| [no-bidi-control](docs/rules/no-bidi-control.md)                                                 | bidirectional controls (Trojan Source)                                                                          | error       |        |
| [no-invisible-characters](docs/rules/no-invisible-characters.md)                                 | zero-width and format characters, Hangul fillers, tag characters, stray variation selectors, control characters | error       |        |
| [no-private-use-or-unassigned-characters](docs/rules/no-private-use-or-unassigned-characters.md) | private-use characters, unassigned code points, noncharacters, unpaired surrogates                              | error       |        |
| [no-confusable-characters](docs/rules/no-confusable-characters.md)                               | ASCII lookalikes and mixed-script words (homographs)                                                            | error       |        |
| [no-unusual-whitespace](docs/rules/no-unusual-whitespace.md)                                     | no-break, thin, ideographic, and other non-ASCII whitespace                                                     | error       | JS fix |
| [no-typographic-characters](docs/rules/no-typographic-characters.md)                             | dashes, curly quotes, ellipsis, bullets, arrows                                                                 | warn        |        |
| [allowed-characters](docs/rules/allowed-characters.md)                                           | any other non-ASCII character not allowed in its context                                                        | error       |        |

The **Recommended** column is the severity the rule has in the `recommended` preset (`strict` raises `no-typographic-characters` to `error`, and `relaxed` lowers `no-unusual-whitespace` to `warn`). The **Fix** column says whether `--fix` changes anything: `JS fix` means unusual whitespace between JavaScript and TypeScript tokens is replaced with an ASCII space, an empty cell means the rule never fixes or suggests anything.

Every character is reported by exactly one rule, so a finding never appears twice.

## Configuring the allow lists

Every rule except `allowed-characters` accepts an `allow` option with one list of entries; `allowed-characters` instead takes one list per source context. Entries are literal characters, code points (`U+00E4`), ranges (`U+0400..U+04FF`), or Unicode property escapes (`\\p{Script=Latin}`). Negated escapes such as `\\P{L}` and escapes that match unassigned code points or every assigned character (`\\p{Any}`, `\\p{Assigned}`, `\\p{Cn}`) are rejected, because they would allow almost every character.

Permit Latin letters in identifiers, for a codebase with German or French names:

```js
{
  rules: {
    'unicode-guard/allowed-characters': ['error', { identifier: ['\\p{Script=Latin}'] }],
  },
}
```

Use the strict policy but allow German umlauts in Markdown prose:

```js
{
  files: ['**/*.md'],
  rules: {
    'unicode-guard/allowed-characters': [
      'error',
      {
        code: [],
        identifier: [],
        comment: [],
        string: [],
        text: ['U+00C4', 'U+00D6', 'U+00DC', 'U+00E4', 'U+00F6', 'U+00FC', 'U+00DF'],
      },
    ],
  },
}
```

A context you leave out keeps the rule's default, which is the `recommended` policy (any visible character in comments, strings, and text), not the policy of the preset you started from. List every context to stay strict.

Checks are based on Unicode scripts, not natural languages: German, French, and Spanish are all `Script=Latin`.

## Recommended setup for security-critical code

Use `strict` everywhere, then allow Latin letters in comments, strings, and text, so umlauts and accents work while all-Cyrillic fake words and lookalikes are still errors. Put `ai-instructions` last so its plain text language and `noInlineConfig` apply:

```js
import { defineConfig } from 'eslint/config';
import unicodeGuard from 'eslint-plugin-unicode-guard';

export default defineConfig([
  unicodeGuard.configs.strict,
  {
    rules: {
      'unicode-guard/allowed-characters': [
        'error',
        {
          comment: ['\\p{Script=Latin}'],
          string: ['\\p{Script=Latin}'],
          text: ['\\p{Script=Latin}'],
        },
      ],
    },
  },
  unicodeGuard.configs['ai-instructions'],
]);
```

Contexts left out (`code`, `identifier`) keep the default of ASCII only. Run the check in CI with zero tolerance for warnings:

```sh
npx eslint . --max-warnings 0
```

Make this check a required status check for merging, otherwise a pull request can bypass it. For Markdown files outside the `ai-instructions` preset, also set `linterOptions: { noInlineConfig: true }`, because an `<!-- eslint-disable -->` comment is invisible when rendered.

## Known limitations

The most important points; the complete list is in [docs/known-limitations.md](docs/known-limitations.md).

- **Whole-script confusables.** Under `recommended`, a word written entirely in Cyrillic or Greek that reads like a Latin word (a Cyrillic `paypal` in a URL) is not reported in comments, strings, and prose, because only words that mix scripts are suspicious without the full UTS #39 confusables data. Use `strict`, or narrow `allowed-characters` for strings, if this matters to you.
- **Character references.** Only characters that are literally in the file are checked. HTML and Markdown character references such as `&#x202E;` or `&#8203;` produce hidden characters in rendered output but are not reported.
- **Squared units, emoji, and number lookalikes.** Squared units (U+338F for `kg`), emoji that NFKC maps to ASCII (U+2139 for `i`), and other numbers (superscript digits) are not reported as lookalikes under `recommended`. `strict` and `ai-instructions` report the emoji and number lookalikes; use `strict` for URLs in strings if squared units matter to you.
- **Legitimate letters are reported.** The Turkish dotless i (U+0131), letters of African orthographies, Greek letters in units, and fullwidth CJK punctuation look like ASCII and are reported as lookalikes or mixed scripts. Allow what you use:

  ```js
  {
    rules: {
      'unicode-guard/no-confusable-characters': ['error', { allow: ['U+0131', 'U+0391..U+03C9', 'U+FF01..U+FF0F'] }],
    },
  }
  ```

- **Parse errors.** A file that fails to parse reports only the parse error; the plugin's rules do not run on it.

## How it works

1. A language adapter maps the file to source contexts (code, identifier, comment, string, text) using the tokens and nodes of the active ESLint language.
2. A scanner visits every character outside printable ASCII and assigns it exactly one category from its Unicode properties: bidi control, invisible, control, private use, unassigned, surrogate, unusual whitespace, typographic, lookalike, mixed script, or other.
3. Each rule reports its own categories, grouped into runs, with exact line and column.

The scanner has no ESLint dependency. Design decisions are recorded in [docs/adr](docs/adr).

## Contributing

Issues and pull requests are welcome. Set up with `npm ci`, then run `npm test` and `npm run lint` before you push. [CLAUDE.md](CLAUDE.md) describes the architecture and commands, [CONTEXT.md](CONTEXT.md) defines the terms, and [docs/adr](docs/adr) records the design decisions. Report security issues as described in [SECURITY.md](SECURITY.md), not in a public issue.

## Migrating from eslint-plugin-unicode-comments

This package replaces `eslint-plugin-unicode-comments`. See [MIGRATION.md](MIGRATION.md).

## Security

See [SECURITY.md](SECURITY.md) for reporting vulnerabilities, including characters or sequences the plugin misses.

## License

[MIT](LICENSE)
