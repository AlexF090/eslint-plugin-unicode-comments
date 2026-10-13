# eslint-plugin-unicode-guard

ESLint plugin that keeps hidden and deceptive Unicode out of your repository, so AI-generated code and AI instruction files are safe to review and merge.

Code review is visual. A reviewer cannot see a zero width space, a bidirectional override, a Cyrillic `a` in a Latin identifier, or an instruction encoded in invisible tag characters. Language models produce these characters by accident, and attackers plant them on purpose: Trojan Source, invisible backdoors, GlassWorm payloads, and the "Rules File Backdoor" all rely on characters a developer would never type. This plugin reports every one of them, with the exact position, the code point, and its name.

- **Every character, every file type.** Rules scan the raw source text, not selected AST nodes, so there are no blind spots. Works with JavaScript, TypeScript, JSX, JSON, Markdown, CSS, YAML, TOML, HTML, and any other file through the bundled plain text language.
- **Allowlist instead of denylist.** Characters are classified by Unicode properties, so new attack characters are covered without a plugin update. Code and identifiers are ASCII only by default; comments, strings, and prose may contain any visible character in any script.
- **Few false positives.** Emoji ZWJ sequences, variation selectors after emoji, subdivision flags, and joiners in Arabic or Indic text are recognised as legitimate.
- **Readable reports.** `Invisible tag characters in a comment encode the hidden text "Ignore all previous instructions" (ASCII smuggling).`
- **Fixes only where provably safe.** `--fix` replaces unusual whitespace between JavaScript and TypeScript tokens, where the language already treats it as whitespace. Everything else gets an editor suggestion, because tools and renderers read comments, strings, and prose: a fixed dash can turn a comment into an `eslint-disable` directive, and a fixed quote or space in Markdown can complete inline HTML, a link, or front matter.

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

| Rule                                                                                             | Reports                                                                                                         | Recommended | Fix        |
| ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- | ----------- | ---------- |
| [no-bidi-control](docs/rules/no-bidi-control.md)                                                 | bidirectional controls (Trojan Source)                                                                          | error       | suggestion |
| [no-invisible-characters](docs/rules/no-invisible-characters.md)                                 | zero-width and format characters, Hangul fillers, tag characters, stray variation selectors, control characters | error       | suggestion |
| [no-private-use-or-unassigned-characters](docs/rules/no-private-use-or-unassigned-characters.md) | private-use characters, unassigned code points, noncharacters, unpaired surrogates                              | error       |            |
| [no-confusable-characters](docs/rules/no-confusable-characters.md)                               | ASCII lookalikes and mixed-script words (homographs)                                                            | error       | suggestion |
| [no-unusual-whitespace](docs/rules/no-unusual-whitespace.md)                                     | no-break, thin, ideographic, and other non-ASCII whitespace                                                     | error       | JS fix     |
| [no-typographic-characters](docs/rules/no-typographic-characters.md)                             | dashes, curly quotes, ellipsis, bullets, arrows                                                                 | warn        | suggestion |
| [allowed-characters](docs/rules/allowed-characters.md)                                           | any other non-ASCII character not allowed in its context                                                        | error       |            |

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

## Known limitations

- **Whole-script confusables.** A word written entirely in Cyrillic or Greek that reads like a Latin word (for example a Cyrillic `paypal` in a URL) is not reported in comments, strings, and prose under `recommended`, because only words that mix scripts are suspicious without the full UTS #39 confusables data. In code and identifiers the ASCII-only policy rejects it, but scripts, styles, and attribute values embedded in HTML count as strings, so a whole Cyrillic identifier there is not reported either. Use `strict` or narrow `allowed-characters` for strings if this matters to you.
- **Joiners in joining scripts.** ZERO WIDTH JOINER and NON-JOINER after a letter of a joining script such as Arabic or Devanagari (optionally followed by marks) and before another character of a joining script are accepted, so the presence or absence of a joiner there can carry a few hidden bits.
- **Lookalikes next to ASCII.** Characters of no particular script, such as the division slash (U+2215), the fraction slash (U+2044), the modifier letter colon (U+A789), and mathematical Greek letters, and CJK characters that may mix with Latin, such as IDEOGRAPHIC NUMBER ZERO (U+3007), are reported only next to an ASCII letter, digit, or URL character. Kana and conjoining Hangul jamo are never reported as lookalikes, because they spell ordinary words next to Latin: KATAKANA LETTER NO (U+30CE) looks like a slash but starts the loanwords for "node" and "note". So math written without spaces (`1<U+2044>2`) and IPA length marks (U+02D0) next to letters are reported, while lookalikes of quotes, brackets, and operators and punctuation of other scripts (CJK wave dash, Devanagari danda) are not.
- **Standardized variation sequences.** Variation selectors 1 to 14 are accepted after the base characters that StandardizedVariants.txt lists for them (for example CJK compatibility ideographs, never after ASCII), so the choice between those few listed selectors can carry a few hidden bits.
- **Regular expression literals** are treated as strings, so a regular expression may contain any visible non-ASCII character, such as a character class of Cyrillic letters. Lookalikes and mixed-script words are still reported.
- **Ideographic variation selectors** (VS17 to VS256) are always reported, also in legitimate ideographic variation sequences. Allow `U+E0100..U+E01EF` in `no-invisible-characters` if you need them.
- **Latin lookalikes** such as the dotless i (U+0131) are reported even where they are ordinary letters, as in Turkish. Allow them in `no-confusable-characters`.
- **Emoji sequences.** VARIATION SELECTOR-15/16 after any pictographic character (including COPYRIGHT SIGN and TRADE MARK SIGN) and up to three ZERO WIDTH JOINERs between pictographic characters are accepted, not only the recommended emoji sequences, so the choice of selector or joiner there can carry a few hidden bits.
- **Markdown front matter.** Unless the Markdown language is configured with `frontmatter: 'yaml'` (or `'toml'`), front matter is parsed as prose, so its values are checked with the prose policy instead of the string policy. Configure the option, as in the example above, if your Markdown files have front matter.
- **Vue and Svelte.** They are not supported languages. With their ESLint parsers, the markup before the first and after the last script token is checked as text and only gets suggestions, but template expressions are not told apart from markup, and markup between two script blocks is treated as JavaScript code, so `--fix` may replace unusual whitespace there.
- **Combining marks on ASCII.** Under `recommended`, comments, strings, and prose allow marks (`\p{M}`), so a visible mark on an ASCII letter in a URL (`p<U+0323>aypal`) is not reported. The `strict` preset and `ai-instructions` report it.
- **Byte order marks in JavaScript.** ESLint removes leading byte order marks from JavaScript and TypeScript files before rules run, so a second one at the start of the file is not reported.
- **Fullwidth punctuation in Chinese and Japanese text.** Fullwidth forms such as U+FF0C (fullwidth comma) and U+FF01 (fullwidth exclamation mark) imitate ASCII and are reported everywhere, also as ordinary punctuation in Chinese and Japanese prose. Allow `U+FF01..U+FF0F`, `U+FF1A..U+FF20`, and the other punctuation you use in `no-confusable-characters` for such files.
- **Unicode version.** Unassigned code points and script membership come from the Unicode version of the running Node.js engine.

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
