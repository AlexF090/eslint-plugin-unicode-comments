# Domain glossary

Terms used consistently across code, tests, and documentation.

- **Source context**: what a region of the source text means to the language. One of `code`, `identifier`, `comment`, `string`, `text`.
  - `code`: syntax outside the other contexts (punctuation, operators, whitespace between tokens, CSS selectors, YAML structure).
  - `identifier`: names the language treats as identifiers or keywords.
  - `comment`: comments of any syntax.
  - `string`: string, template, and regular expression literals; JSON strings; YAML and TOML scalar values; Markdown code blocks, inline code, embedded HTML, and front matter; HTML script and style content.
  - `text`: prose (Markdown prose, HTML text, JSX text, plain text files).
- **Context range**: a `[start, end)` offset range of the source text with one source context. Produced by a language adapter.
- **Language adapter**: maps an ESLint `SourceCode` of one language to context ranges and a default context for uncovered text.
- **Category**: the single classification a scanned character receives: `bidi-control`, `invisible`, `control`, `private-use`, `unassigned`, `surrogate`, `unusual-whitespace`, `typographic`, `lookalike`, `mixed-script`, or `other`.
- **Finding**: one categorised character occurrence: offset, length, code point, category, source context, and an optional ASCII replacement.
- **Vetted sequence**: an otherwise suspicious character accepted because it is part of a legitimate sequence (emoji ZWJ sequence of at most three joiners, emoji presentation selector after a pictograph or in a keycap, standardized variation sequence listed in StandardizedVariants.txt, RGI subdivision flag, joiner after a letter of a joining script, optionally followed by marks, and before another character of a joining script, by Script property). Only accepted in `comment`, `string`, and `text`.
- **Allow entry**: one item of an `allow` option: a literal character, `U+XXXX`, a range `U+XXXX..U+YYYY`, or a Unicode property escape such as `\p{Script=Latin}`. Negated escapes (`\P{...}`) and escapes that match unassigned code points or every assigned character (`\p{Any}`, `\p{Assigned}`, `\p{Cn}`) are rejected because they would allow almost everything.
- **Context policy**: the allow entries per source context used by `allowed-characters`.
