# Changelog

All notable changes to this project are documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0]

First release as `eslint-plugin-unicode-guard`, a rewrite of `eslint-plugin-unicode-comments` 2.1.3. See [MIGRATION.md](MIGRATION.md).

### Added

- Seven rules split by kind of character: `no-bidi-control`, `no-invisible-characters`, `no-private-use-or-unassigned-characters`, `no-confusable-characters`, `no-unusual-whitespace`, `no-typographic-characters`, `allowed-characters`.
- Scanning of the raw source text of every ESLint language: JavaScript, TypeScript, JSX, JSON, Markdown, CSS, YAML, TOML, HTML.
- Plain text language `unicode-guard/text` for files without an ESLint parser.
- Presets `recommended`, `strict`, `relaxed`, and `ai-instructions` (assistant instruction files such as `AGENTS.md`, `CLAUDE.md`, `SKILL.md`, `.cursorrules`, matched in any letter case, with inline configuration comments disabled).
- Detection of tag characters (with the hidden text decoded in the message), stray variation selectors, private-use characters, unassigned code points, control characters, Hangul fillers, all Unicode spaces, mixed-script words, NFKC lookalikes, and Latin lookalikes from UTS #39 such as the dotless i, lookalikes of no particular script or of CJK scripts next to ASCII (division and fraction slashes, modifier letter colon, mathematical Greek, IDEOGRAPHIC NUMBER ZERO), blank fillers, and carriage returns that are not followed by a line feed.
- Accepted sequences for emoji, keycaps, subdivision flags, standardized variation sequences listed in StandardizedVariants.txt, and joiners between letters of a joining script. Ideographic variation selectors (VS17 to VS256) are always reported.
- `allow` options with code points, ranges, and Unicode property escapes (escapes that would allow almost everything are rejected); per-context policy for `allowed-characters`.
- Autofixes for typographic characters and unusual whitespace in Markdown prose, and for unusual whitespace in JavaScript and TypeScript code; suggestions in comments, strings, Markdown code and link targets, rendered JSX and HTML text, and plain text files, wherever a fix would insert a line break or could end a comment early, in the code of other languages, in Markdown blocks that contain `<`, `[`, or `]`, and in words that could be autolinks.
- Regression corpus of published attacks.

### Changed

- Requires ESLint `^9.38.0 || ^10.0.0` and Node.js `^22.13.0 || >=24`; ESM only; flat configuration only.
- Problems point to the exact character and name its code point.
- Escape sequences in literals are no longer reported.

### Removed

- ESLint 8 and `.eslintrc` support.
- All rule names of `eslint-plugin-unicode-comments`.

[Unreleased]: https://github.com/AlexF090/eslint-plugin-unicode-guard/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/AlexF090/eslint-plugin-unicode-guard/releases/tag/v1.0.0
