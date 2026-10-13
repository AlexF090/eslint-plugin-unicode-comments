# 0005: Fix only whitespace between JavaScript tokens and offer no suggestions

- Status: accepted
- Date: 2026-10-13

## Context

The plugin first fixed typographic characters and unusual whitespace in comments, Markdown prose, and other contexts, and suggested replacements or removals everywhere else. Review rounds kept finding replacements that create syntax once applied: a dash before `>` ends an HTML comment, a line separator ends a YAML comment, a fixed quote or space completes inline HTML, a link, or front matter in Markdown, a comma splits a YAML flow list, and a dash turns `eslint<U+2010>disable` into a live directive. Even letters create syntax: removing a joiner in `retu<U+200D>rn` yields a keyword, and replacing a fullwidth letter can complete `<script>`, `javascript:`, or a YAML boolean. Each guard closed one case, and the next review found another.

## Decision

- The only automatic fix replaces unusual whitespace between the tokens of JavaScript and TypeScript (`src/rules/fix-whitespace-between-tokens.ts`). The language already treats that whitespace as a separator, so a space keeps the meaning. A replacement that inserts a line break is never applied.
- No rule offers editor suggestions. Messages name the ASCII replacement, and the user applies it by hand after checking what the character does.

## Consequences

- An automatic or suggested change can never turn inert content into live code, markup, or configuration, so a whole class of attacks through the linter itself is closed instead of patched case by case.
- `eslint --fix` no longer cleans up typographic characters, and editors offer no quick fix. Users replace these characters by hand; the message tells them what to type.
- A new correction may only be added if it is provably meaning-preserving in every language where it can apply.
