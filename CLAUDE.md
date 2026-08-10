# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

ESLint plugin (`eslint-plugin-unicode-comments`) that detects dangerous and suspicious Unicode characters in comments, string literals, template literals, and identifiers. Rules are split into two severity-driven families:

- **Security** (`error` in `recommended`): Trojan Source bidi overrides, homograph attacks (Cyrillic/Greek), zero-width/invisible characters, fullwidth ASCII variants, mathematical alphanumeric spoofing — real obfuscation/attack vectors.
- **Style** (`warn` in `recommended`, `-style` rule name suffix): Unicode hyphens/dashes, Unicode quotes, and other typographic artifacts (ellipsis, non-breaking/thin/figure space, bullet) — this is the plugin's primary practical use case: flagging tells of unedited, AI-generated code. Not a security concern, hence lower default severity.

## Commands

```bash
npm run build          # Compile src/ -> dist/ via tsc
npm test                # Run full test suite (vitest run)
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report (v8 provider)
npm run test:ui         # Vitest UI
npm run lint            # eslint src/**/*.ts (flat config in eslint.config.mjs)
npm run format:check    # prettier --check .
npm run format:write    # prettier --write .
```

Run a single test file: `npx vitest run tests/dangerous-comments.test.ts`

`npm run build` (tsc) is the type-check for `src/`. Test files are checked separately via `npm run type-check:tests` (`tsc -p tsconfig.test.json`), run in CI right after `npm run build`.

`eslint.config.mjs` is ESM (`.mjs` extension) even though the package itself is CommonJS (`package.json` has no `"type": "module"`) — a plain `eslint.config.js` with `import` statements would fail to load under Node's default CJS resolution.

## CI/CD & Release

- `.github/workflows/ci.yml` — runs on every push/PR against `main`: `npm ci`, `npm audit --audit-level=moderate`, `build`, `lint`, `format:check`, `test`, `test:coverage`. Runs as a matrix over `eslint-version: ['8.57.1', '9.39.5', '10.8.1']` with `fail-fast: false` (so a failure on one ESLint major doesn't cancel the others) — after `npm ci` (which installs the `devDependencies`-pinned ESLint), each matrix leg overrides it via `npm install eslint@<version> --no-save` before the rest of the steps run, verifying the `peerDependencies.eslint: ">=8.40.0"` claim actually holds across all three majors. Merging to `main` does **not** publish anything by itself.
- `.github/dependabot.yml` — weekly automated PRs for npm dependencies and GitHub Actions versions.
- `.github/workflows/release.yml` — triggers only on a pushed tag matching `v*.*.*`. Publishes to npm via **Trusted Publishing (OIDC)** — no `NPM_TOKEN` secret, but requires the npmjs.com package's "Trusted Publisher" settings to reference this repo (`AlexF090/eslint-plugin-unicode-comments`) and workflow filename `release.yml`.
- Tagging is **manual, not automated** (no semantic-release/release-please). After merging to `main`, cut a release with:
  ```bash
  git checkout main && git pull
  npm version patch   # or minor/major — bumps package.json and creates the local git tag
  git push --tags     # this push is what triggers release.yml
  ```
- `.husky/pre-commit` runs `lint-staged` (`eslint --fix` + `prettier --write` on staged files) — configured in `package.json`'s `lint-staged` field.
- `.npmrc` pins `save-exact=true`, so all `devDependencies` are exact versions (no `^`/`~`); `ignore-scripts` is deliberately _not_ set since it would break Husky's own `prepare` hook.

## Architecture

- `src/index.ts` — plugin entry point. Registers 10 rule ids in `rules` (4 security rules — also exposed under their original pre-split names for backwards compatibility — plus 3 `-security` aliases, 3 `-style` rules, and `dangerous-unicode-identifiers`), and exports `configs.recommended`/`configs['flat/recommended']` with mixed severities (`error` for security rule names, `warn` for `-style` rule names). Exports as both an ESM default export and, defensively, via `module.exports` for legacy CommonJS consumers (ESLint 8 `.eslintrc` `plugins`/`extends`). `index.ts` at the repo root re-exports from `dist` after build; `dist/index.js` is what `package.json`'s `main` points to.
- `src/rules/*.ts` — each file is a standalone `Rule.RuleModule`, split by file type into a security variant and a style variant:
  - `dangerous-comments.ts` (`dangerous-unicode`) / `dangerous-comments-style.ts` (`dangerous-unicode-style`) — scan all comments via `sourceCode.getAllComments()`. Only the style rule is **auto-fixable**: it replaces dangerous chars using `unicodeToAsciiMap` and rewrites the comment text; the security rule has no ASCII equivalent for its categories (Trojan Source, homographs, math spoofing) so it's detect-only.
  - `dangerous-literals.ts` (`dangerous-unicode-literals`) / `dangerous-literals-style.ts` (`dangerous-unicode-literals-style`) — check `Literal` string nodes against a sequence of category-specific regexes, reporting the first category that matches with a category-specific message. Not fixable (raw string literal editing isn't attempted).
  - `dangerous-template-literals.ts` (`dangerous-unicode-template-literals`) / `dangerous-template-literals-style.ts` (`dangerous-unicode-template-literals-style`) — check `TemplateLiteral` quasis (raw text) against one combined pattern per variant. Not fixable.
  - `dangerous-identifiers.ts` (`dangerous-unicode-identifiers`) — checks `Identifier` names, only for Cyrillic/Greek homograph ranges (security-only; no style variant, since NBSP/ellipsis/etc. aren't valid identifier characters).
- `src/utils/unicode-mapping.ts` — the only fix-data source: `unicodeToAsciiMap` maps individual dangerous Unicode dashes/quotes/spacing/bullet characters to ASCII equivalents. Used exclusively by `dangerous-comments-style.ts`'s fixer.

### Important asymmetry between rules

The security/style rule pairs do **not** share a single canonical pattern set across file types — `dangerous-comments(-style)` and `dangerous-template-literals(-style)` each redefine their own combined regex inline (same categories, same union pattern), while `dangerous-literals(-style)` defines the categories as a separate `unicodePatterns` object and checks them one-by-one for granular messages. `dangerous-identifiers` only checks the homograph categories (no style equivalent). When adding a new dangerous Unicode category or character, update it in all relevant rule files individually — there is no single shared pattern module to edit. Decide first whether the new category is a security concern (add to the non-style file, `error` severity) or a stylistic/AI-tell (add to the `-style` file and `unicodeToAsciiMap`, `warn` severity).

### Testing

Tests live in `tests/*.test.ts`, one file per rule, using vitest (`globals: true`, `environment: "node"`). Import `RuleTester` from `./rule-tester` (not directly from `'eslint'`) — `tests/rule-tester.ts` picks `FlatRuleTester` from `eslint/use-at-your-own-risk` on ESLint <9 and the default flat-config-native `RuleTester` on 9+, since ESLint 8's default `RuleTester` rejects flat-config options like `languageOptions` that these tests use. Follow this import pattern consistent with the existing test files when adding cases for new dangerous-character categories.
