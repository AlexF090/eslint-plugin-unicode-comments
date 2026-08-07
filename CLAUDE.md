# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

ESLint plugin (`eslint-plugin-unicode-comments`) that detects and blocks dangerous Unicode characters (Trojan Source bidi overrides, homograph attacks, zero-width/invisible characters, fullwidth ASCII variants, Unicode quotes/hyphens) in comments, string literals, template literals, and identifiers.

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

There is no separate type-check script; `npm run build` (tsc) is the type-check for `src/`. Test files are checked separately via `tsconfig.test.json` (not wired to an npm script).

`eslint.config.mjs` is ESM (`.mjs` extension) even though the package itself is CommonJS (`package.json` has no `"type": "module"`) — a plain `eslint.config.js` with `import` statements would fail to load under Node's default CJS resolution.

## Architecture

- `src/index.ts` — plugin entry point. Exports the plugin object (`rules`, `configs.recommended`) as both an ESM default export and, defensively, via `module.exports` for legacy CommonJS consumers (ESLint 8 `.eslintrc` `plugins`/`extends`). `index.ts` at the repo root re-exports from `dist` after build; `dist/index.js` is what `package.json`'s `main` points to.
- `src/rules/*.ts` — one rule per file, each a standalone `Rule.RuleModule`:
  - `dangerous-comments.ts` (`dangerous-unicode`) — scans all comments via `sourceCode.getAllComments()`, **auto-fixable**: replaces dangerous chars using `unicodeToAsciiMap` and rewrites the comment text.
  - `dangerous-literals.ts` (`dangerous-unicode-literals`) — checks `Literal` string nodes against a sequence of category-specific regexes (invisible chars, trojan source, hyphens, Cyrillic/Greek homographs, math symbols, fullwidth ASCII, zero-width, quotes), reporting the first category that matches with a category-specific message. Not fixable.
  - `dangerous-template-literals.ts` (`dangerous-unicode-template-literals`) — checks `TemplateLiteral` quasis (raw text) against one combined pattern. Not fixable.
  - `dangerous-identifiers.ts` (`dangerous-unicode-identifiers`) — checks `Identifier` names, currently only for Cyrillic/Greek homograph ranges (narrower scope than the other three rules).
- `src/utils/unicode-mapping.ts` — the only fix-data source: `unicodeToAsciiMap` maps individual dangerous Unicode dashes/quotes to ASCII equivalents. Used exclusively by the comments rule's fixer.

### Important asymmetry between rules

The four rules do **not** share a single canonical pattern set — `dangerous-comments` and `dangerous-template-literals` each redefine their own combined regex inline (same categories, same union pattern), `dangerous-literals` defines the categories as a separate `unicodePatterns` object and checks them one-by-one for granular messages, and `dangerous-identifiers` only checks two of the eight categories. When adding a new dangerous Unicode category or character, update it in all relevant rule files individually — there is no single shared pattern module to edit.

### Testing

Tests live in `tests/*.test.ts`, one file per rule, using vitest (`globals: true`, `environment: "node"`). Use ESLint's `RuleTester` (or equivalent invocation) patterns consistent with the existing test files when adding cases for new dangerous-character categories.
