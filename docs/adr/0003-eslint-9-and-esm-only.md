# 0003: Support ESLint 9.38+ and 10 only, ship ESM only

- Status: accepted
- Date: 2026-10-13

## Context

ESLint 8 reached end of life on 2024-10-05 and has no language plugin support, so JSON, Markdown, CSS, YAML, TOML, and HTML cannot be linted there. ESLint 10 removed the eslintrc configuration format. ESLint 9 reached end of life on 2026-08-06 but is still widely deployed. `eslint-plugin-yml` and `eslint-plugin-toml` require ESLint 9.38.0 or later.

## Decision

- `peerDependencies.eslint` is `^9.38.0 || ^10.0.0`. CI runs the full test suite against the latest ESLint 9 and the latest ESLint 10.
- Only flat configuration is supported. No eslintrc presets, no `module.exports` compatibility shim.
- The package is ESM only (`"type": "module"`). Supported Node.js versions (`^20.19.0 || ^22.13.0 || >=24`) can `require()` ES modules, so CommonJS configuration files keep working.
- The plugin object carries `meta.name`, `meta.version`, and `meta.namespace` read from `package.json`.

## Consequences

- Users on ESLint 8 stay on `eslint-plugin-unicode-comments`, which is deprecated but remains installable.
- Dropping ESLint 9 later is a semver-major change.
