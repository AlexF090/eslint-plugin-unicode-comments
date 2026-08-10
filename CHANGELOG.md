# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- CI now runs a matrix against ESLint `8.x`, `9.x`, and `10.x`, verifying
  the `peerDependencies.eslint: ">=8.40.0"` claim across all three majors
  instead of only the pinned devDependency version.
- CI now runs `npm audit --audit-level=moderate` as a required gate.
- Weekly automated dependency updates via Dependabot (`npm` and
  `github-actions` ecosystems).

### Fixed

- Test suite's `RuleTester` usage now works under ESLint 8, whose default
  `RuleTester` rejects flat-config options like `languageOptions`.

## [2.1.0] - 2026-08-07

### Added

- New `-style` rule variants (`dangerous-unicode-style`,
  `dangerous-unicode-literals-style`, `dangerous-unicode-template-literals-style`)
  covering typographic tells of unedited AI-generated text (Unicode
  hyphens/dashes, Unicode quotes, ellipsis, non-breaking/thin/figure space,
  bullet). Registered at `warn` severity in the `recommended` presets,
  separate from the `error`-level security rules (Trojan Source, homograph,
  math spoofing, fullwidth ASCII, invisible characters).
- Detection of three additional typographic AI-generated text tells: thin
  space (U+2009), figure space (U+2007), and bullet (U+2022), all
  auto-fixable in comments via the existing `unicodeToAsciiMap`.
- CI workflow (`.github/workflows/ci.yml`) running build, lint, format-check,
  and tests on every push/PR against `main`.
- Release workflow (`.github/workflows/release.yml`) publishing to npm via
  Trusted Publishing on tagged releases.
- Pre-commit hooks via Husky + lint-staged.
- `.npmrc` with supply-chain hardening (`save-exact`, `engine-strict`,
  `strict-ssl`).
- `LICENSE` file (MIT).

### Changed

- Narrowed Cyrillic/Greek homograph detection across all rules to a
  consistent, visually-confusable subset (previously inconsistent between
  `dangerous-literals` and the other rules, which used full alphabet ranges).
- Corrected the Mathematical Alphanumeric Symbols check in
  `dangerous-comments`/`dangerous-template-literals` to match the full
  UTF-16 surrogate pair instead of the bare high surrogate.
- The original rule names (`dangerous-unicode`, `dangerous-unicode-literals`,
  `dangerous-unicode-template-literals`) now cover security categories only;
  enable the corresponding `-style` rule to keep flagging Unicode
  dashes/quotes/typographic artifacts under those rule names.
- Updated dependencies to latest compatible versions: ESLint 10, Vitest 4,
  TypeScript 6.0, `@types/node` 20.
- Corrected `peerDependencies.eslint` floor from `>=8.0.0` to `>=8.40.0`
  (the minimum version providing `context.sourceCode`, which the
  `dangerous-unicode` rule relies on).
- Raised `engines.node` to `>=20.0.0` to track the current Active LTS line.
- Added a modern `exports` map alongside `main`/`types` in `package.json`.

### Fixed

- Removed dead/unreachable zero-width character check in
  `dangerous-literals` (shadowed by an identical earlier check).
- The `dangerous-comments` fixer no longer reports a no-op fix for
  categories it cannot actually fix (Trojan Source, homographs, math
  spoofing, fullwidth ASCII, invisible characters) — those categories moved
  to the detect-only security rule, while fixable categories moved to the
  new `-style` rule.
- Added `dist/**/*.js.map` and `dist/**/*.d.ts.map` to the published `files`
  allowlist so source maps ship with the package.
- Added a Flat Config-compatible preset (`configs['flat/recommended']`) so
  ESLint 9+ users no longer have to list all rules manually.

## [2.0.1] - 2025-08-22

### Fixed

- CommonJS compatibility fix for legacy ESLint 8 `.eslintrc` consumers.

## [2.0.0] - 2025-08-22

### Added

- Legacy ESLint config support (`.eslintrc`) alongside the flat config
  `recommended` export.

### Changed

- Restructured the plugin into one rule per file under `src/rules/`.

## [1.0.0] - 2025-08-22

### Added

- Initial release: `dangerous-unicode`, `dangerous-unicode-literals`,
  `dangerous-unicode-template-literals`, and `dangerous-unicode-identifiers`
  rules detecting Trojan Source, homograph, invisible/zero-width, and
  fullwidth Unicode characters in comments, literals, and identifiers.

[unreleased]: https://github.com/AlexF090/eslint-plugin-unicode-comments/compare/v2.1.0...HEAD
[2.1.0]: https://github.com/AlexF090/eslint-plugin-unicode-comments/compare/v2.0.1...v2.1.0
[2.0.1]: https://github.com/AlexF090/eslint-plugin-unicode-comments/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/AlexF090/eslint-plugin-unicode-comments/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/AlexF090/eslint-plugin-unicode-comments/releases/tag/v1.0.0
