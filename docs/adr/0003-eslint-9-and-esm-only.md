# 0003: Support ESLint 9.38+ and 10 only, ship ESM only

- Status: accepted
- Date: 2026-10-13

## Context

ESLint 8 reached end of life on 2024-10-05 and has no language plugin support, so JSON, Markdown, CSS, YAML, TOML, and HTML cannot be linted there. ESLint 10 removed the eslintrc configuration format. ESLint 9 reached end of life on 2026-08-06 but is still widely deployed. Node.js 20 reached end of life on 2026-04-30, and current development tooling no longer installs on it. `eslint-plugin-yml` and `eslint-plugin-toml` require ESLint 9.38.0 or later.

## Decision

- `peerDependencies.eslint` is `^9.38.0 || ^10.0.0`. CI runs the full test suite against pinned ESLint 9 and ESLint 10 releases on Node.js 22 and 24, and against the lower bounds, ESLint 9.38.0 on Node.js 22.13.0. The pinned versions are listed in `.github/workflows/ci.yml` and raised deliberately.
- Only flat configuration is supported. No eslintrc presets.
- Supported Node.js versions are `^22.13.0 || >=24`, the maintained release lines.
- The package is ESM only (`"type": "module"`), without a CommonJS build. The supported Node.js versions can `require()` ES modules, and the entry point exports the plugin as `module.exports`, so `require('eslint-plugin-unicode-guard')` in a CommonJS configuration file returns the plugin without `.default`. CI checks this with `require()` on every Node.js version in the matrix and with a CommonJS configuration in the packed-tarball smoke test.
- The plugin object carries `meta.name`, `meta.version`, and `meta.namespace` read from `package.json`.

## Consequences

- Users on ESLint 8 stay on `eslint-plugin-unicode-comments`, which is deprecated but remains installable.
- Dropping ESLint 9 later is a semver-major change.
