# 0001: Classify every non-ASCII character instead of matching a denylist

- Status: accepted
- Date: 2026-10-13

## Context

`eslint-plugin-unicode-comments` (the predecessor) kept a hand-written list of "dangerous" code points per rule file. Anything not on the list passed silently. That missed whole attack classes: Unicode tag characters (ASCII smuggling), variation selectors used as a payload carrier, private-use characters, Hangul fillers inside identifiers, uppercase Cyrillic homoglyphs, and most of the unusual whitespace characters.

The goal of `eslint-plugin-unicode-guard` is to make AI-generated code safe to merge: any character a human developer would not normally type must be visible in review.

## Decision

- The scanner visits **every** character outside printable ASCII plus tab, line feed, and carriage return.
- Each such character gets exactly one category, decided in a fixed priority order (bidi control, invisible, private use or unassigned, unusual whitespace, typographic, confusable, other). Categories are derived from Unicode properties (`\p{Bidi_Control}`, `\p{Default_Ignorable_Code_Point}`, `\p{Cf}`, `\p{Co}`, `\p{Cn}`, `\p{Zs}`, NFKC normalization, script membership), so new Unicode versions are covered by the JavaScript engine rather than by hand edits.
- Characters that fall into no dangerous category are judged by `allowed-characters`, an allowlist per source context. The `recommended` preset allows only ASCII in code and identifiers, and any visible character in comments, strings, and prose. The `strict` preset allows only ASCII everywhere.
- Each rule owns a disjoint set of categories, so one character never produces two reports.
- Legitimate uses of otherwise invisible characters are recognised and accepted only in comments, strings, and prose: emoji ZWJ sequences (at most three joiners), emoji presentation selectors after pictographs and in keycap sequences, standardized variation selectors (VS1 to VS14) after ideographs, the three RGI subdivision flag tag sequences, and ZWJ/ZWNJ between letters of scripts that need them. Ideographic variation selectors (VS17 to VS256) are not vetted, because without the Ideographic Variation Database any ideograph could carry a hidden byte.

## Consequences

- No category can be forgotten in one rule file but not another; there is one classifier.
- Unassigned code points depend on the Unicode version of the running Node.js engine. A character assigned in a newer Unicode version may be reported as unassigned on an older Node.js release.
- Whole-script confusables (for example a word written entirely in Cyrillic that reads like a Latin word) are not detected in comments and strings, because that would require the UTS #39 confusables data set. In identifiers and code they are caught by the ASCII-only policy.
- Vetted sequences leave a narrow covert channel: the presence or absence of a vetted joiner or presentation selector can encode bits. It is bounded to one selector per base character and three joiners per emoji sequence, and accepted because rejecting these sequences would report ordinary emoji and Arabic or Indic text.
- Lookalikes are found by NFKC normalization plus a generated table of Latin letters that UTS #39 lists as confusable with ASCII (`scripts/generate-unicode-data.ts`). The table is the one place where a data file, not a Unicode property, decides a category; it is regenerated per Unicode version.
