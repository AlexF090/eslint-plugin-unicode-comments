# 0002: ESLint-free scanner core with thin language adapters

- Status: accepted
- Date: 2026-10-13

## Context

The predecessor implemented detection inside ESLint AST visitors (`Literal`, `TemplateLiteral`, `Identifier`, comments). Every AST node type that was not visited was a blind spot: whitespace between tokens, regular expression literals, JSX text, private identifiers, and every non-JavaScript file. It also checked cooked string values, so a harmless escape sequence such as `"\u202E"` was reported while the source text contained only ASCII.

## Decision

- `src/core/` contains the scanner. It takes the raw source text and a list of context ranges and returns findings. It imports nothing from ESLint, which keeps it unit-testable and lets a future command line interface reuse it.
- `src/languages/` contains one adapter per ESLint language. An adapter only answers "which context is the text at this offset?" (code, identifier, comment, string, or text). Text that no adapter range covers falls back to the adapter's default context.
- Rules scan `sourceCode.text` once per file from the root node visitor (`{ [sourceCode.ast.type]: scan }`) and report each finding with a precise `loc`. They do not declare `meta.languages`, so they run in every language.
- The plugin ships its own `text` language (`unicode-guard/text`) built on `@eslint/plugin-kit`, so files without an ESLint parser (`.cursorrules`, `.env`, shell scripts, Dockerfiles, Python) can be linted as plain text.

## Consequences

- New AST node types cannot create blind spots: everything is scanned, adapters only refine the context.
- Adapters detect their language from the shape of `sourceCode.ast`, because ESLint does not expose the language identifier to rules. A parser that produces an unknown root shape is treated as plain text, which applies the most conservative context rules for identifiers and code (none) and the default prose rules elsewhere.
- `@eslint/plugin-kit` and `@eslint/core` become runtime dependencies. Both are maintained by the ESLint team and are already installed by ESLint itself.
