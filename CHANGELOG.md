# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Changed

- Updated dependencies to latest compatible versions: ESLint 10, Vitest 4,
  TypeScript 6.0, `@types/node` 20.
- Corrected `peerDependencies.eslint` floor from `>=8.0.0` to `>=8.40.0`
  (the minimum version providing `context.sourceCode`, which the
  `dangerous-unicode` rule relies on).
- Raised `engines.node` to `>=24.0.0` to track the current Node.js LTS line.
- Added a modern `exports` map alongside `main`/`types` in `package.json`.

### Added

- CI workflow (`.github/workflows/ci.yml`) running build, lint, format-check,
  and tests on every push/PR against `main`.
- Release workflow (`.github/workflows/release.yml`) publishing to npm via
  Trusted Publishing on tagged releases.
- Pre-commit hooks via Husky + lint-staged.
- `.npmrc` with supply-chain hardening (`save-exact`, `engine-strict`,
  `strict-ssl`).
- `LICENSE` file (MIT).

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

[unreleased]: https://github.com/AlexF090/eslint-plugin-unicode-comments/compare/v2.0.1...HEAD
[2.0.1]: https://github.com/AlexF090/eslint-plugin-unicode-comments/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/AlexF090/eslint-plugin-unicode-comments/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/AlexF090/eslint-plugin-unicode-comments/releases/tag/v1.0.0
