# Known limitations

What `eslint-plugin-unicode-guard` does not report, what it reports although the text is legitimate, and which sequences it accepts on purpose. Where a limitation has a remedy, it is named in the entry. The most important points are summarised in the [README](../README.md#known-limitations).

## Detection gaps

- **Whole-script confusables.** A word written entirely in Cyrillic or Greek that reads like a Latin word (for example a Cyrillic `paypal` in a URL) is not reported in comments, strings, and prose under `recommended`, because only words that mix scripts are suspicious without the full UTS #39 confusables data. In code and identifiers the ASCII-only policy rejects it, but scripts, styles, and attribute values embedded in HTML count as strings, so a whole Cyrillic identifier there is not reported either. Use `strict` or narrow `allowed-characters` for strings if this matters to you.
- **Character references.** Only characters that are literally in the file are checked. HTML and Markdown character references such as `&#x202E;` or `&#8203;` produce hidden characters in rendered output but are not reported.
- **Lookalikes that are emoji or numbers.** Characters that NFKC maps to ASCII but that are emoji (U+2139 INFORMATION SOURCE for `i`, circled letters) or other numbers (superscript digits, tally marks) are not reported as lookalikes under `recommended`, so ordinary emoji and footnote digits stay allowed. `strict` and `ai-instructions` report them.
- **Squared units and abbreviations.** Symbols such as U+338F (`kg`), U+33A7 (`m/s`), U+2116 (`No`), and U+2122 (`TM`) are not reported as lookalikes, because they are ordinary in Chinese, Japanese, Korean, and Russian text. International domain names map them to ASCII, so `ex<U+338F>mple.com` resolves to `exkgmple.com`; use `strict` for URLs in strings if this matters to you.
- **Lookalikes next to ASCII.** Some lookalikes are reported only when they stand next to an ASCII letter, digit, or URL character. This applies to:
  - characters of no particular script, such as the division slash (U+2215), the fraction slash (U+2044), the modifier letter colon (U+A789), and mathematical Greek letters;
  - CJK characters that may mix with Latin, such as IDEOGRAPHIC NUMBER ZERO (U+3007);
  - letterlike symbols (U+2100 - U+214F) and mathematical alphanumeric symbols (U+1D400 - U+1D7FF) that NFKC maps to ASCII. `x <U+2208> <U+211D>` is accepted, `<U+211D>x.com` is reported.

  Math written without spaces (`1<U+2044>2`) is therefore reported. The following are never reported as lookalikes:
  - math symbols that imitate several ASCII characters (INFINITY for `oo`, PARALLEL TO for `ll`), squared units, modifier letters, superscripts and subscripts, and SCRIPT SMALL L (U+2113);
  - kana and conjoining Hangul jamo, because they spell ordinary words next to Latin: KATAKANA LETTER NO (U+30CE) looks like a slash but starts the loanwords for "node" and "note";
  - lookalikes of quotes, brackets, and operators, and punctuation of other scripts (CJK wave dash, Devanagari danda).

- **Punctuation of other scripts in URLs.** IDEOGRAPHIC FULL STOP (U+3002) and HALFWIDTH IDEOGRAPHIC FULL STOP (U+FF61) between ASCII labels (`example<U+3002>com`) are not reported under `recommended`, although browsers treat them as dots in domain names. Digits of other scripts next to ASCII digits only (`10.0.0.<U+0660>5`) are not reported either. `strict` reports both.
- **Combining marks on ASCII.** Under `recommended`, comments, strings, and prose allow marks (`\p{M}`), so a visible mark on an ASCII letter in a URL (`p<U+0323>aypal`) is not reported. The `strict` preset and `ai-instructions` report it.
- **Rare lookalikes and legacy spellings.** A few characters that look like ASCII but belong to a script that does not mix with Latin, such as VEDIC SIGN JIHVAMULIYA (U+1CF5) and the CJK strokes U+31D2 and U+31D3, are not reported next to ASCII. Old-style Malayalam chillu spellings (consonant, virama, ZERO WIDTH JOINER at the end of a word) are reported as invisible characters; the atomic chillu letters of Unicode 5.1 are not.
- **Regular expression literals** are treated as strings, so a regular expression may contain any visible non-ASCII character, such as a character class of Cyrillic letters. Lookalikes and mixed-script words are still reported.
- **Byte order marks in JavaScript.** ESLint removes leading byte order marks from JavaScript and TypeScript files before rules run, so a second one at the start of the file is not reported.
- **Inline configuration in Markdown.** Under `recommended`, an `<!-- eslint-disable -->` comment in an ordinary Markdown file disables the checks for the rest of it. Set `linterOptions: { noInlineConfig: true }` for Markdown files.

## Reported although legitimate

Each of these can be allowed with an `allow` entry of the named rule; see [Configuring the allow lists](../README.md#configuring-the-allow-lists).

- **Latin letters of African and other orthographies, and the Turkish dotless i.** Letters such as U+028B and U+0192 (Ewe), U+0263 (Akan, Kabyle), the dotless i (U+0131, Turkish), and IPA letters are reported as lookalikes, even where they are ordinary letters. Allow them in `no-confusable-characters`.
- **Roman numerals and Latin digraphs.** Roman numerals that stand for several letters (such as U+2161 for `II`, always reported) and the digraphs of Dutch and Croatian (U+0132, U+0133, U+01C7..U+01CC, U+01F1..U+01F3) read as ASCII letter sequences and are reported, also where they are ordinary text. Allow them in `no-confusable-characters` if you write them.
- **Greek letters in units.** A Greek letter inside a Latin word is reported as a mixed script, also in units and formulas such as `10 k<U+03A9>`, `5 <U+03BC>s`, and `<U+0394>t`. Allow the letters you use (`U+0391..U+03C9`) in `no-confusable-characters` for datasheets and physics text.
- **Fullwidth punctuation in Chinese and Japanese text.** Fullwidth forms such as U+FF0C (fullwidth comma) and U+FF01 (fullwidth exclamation mark) imitate ASCII and are reported everywhere, also as ordinary punctuation in Chinese and Japanese prose. Allow `U+FF01..U+FF0F`, `U+FF1A..U+FF20`, and the other punctuation you use in `no-confusable-characters` for such files.
- **No-break spaces in typography.** NO-BREAK SPACE and NARROW NO-BREAK SPACE (U+00A0, U+202F) in French typography and Mongolian are reported as unusual whitespace.
- **MONGOLIAN VOWEL SEPARATOR** (U+180E) is always reported as an invisible character.
- **Ideographic variation selectors** (VS17 to VS256) are always reported, also in legitimate ideographic variation sequences. Allow `U+E0100..U+E01EF` in `no-invisible-characters` if you need them.

## Accepted sequences (covert channels)

These sequences are accepted because they are legitimate in real text. The choice between the accepted alternatives can carry a few hidden bits, so they are a possible covert channel, not a way to hide readable instructions.

- **Joiners in joining scripts.** ZERO WIDTH JOINER and NON-JOINER after a letter of a joining script such as Arabic or Devanagari (optionally followed by marks) and before another character of a joining script are accepted, so the presence or absence of a joiner there can carry a few hidden bits.
- **Standardized variation sequences.** Variation selectors 1 to 14 and the Mongolian free variation selectors (U+180B - U+180D, U+180F) are accepted after the base characters that StandardizedVariants.txt lists for them (for example CJK compatibility ideographs, never after ASCII), so the choice between those few listed selectors can carry a few hidden bits.
- **Emoji sequences.** VARIATION SELECTOR-15/16 after any pictographic character (including COPYRIGHT SIGN and TRADE MARK SIGN) and up to three ZERO WIDTH JOINERs between pictographic characters are accepted, not only the recommended emoji sequences, so the choice of selector or joiner there can carry a few hidden bits.

## Configuration and languages

- **Markdown front matter.** Unless the Markdown language is configured with `frontmatter: 'yaml'` (or `'toml'`), front matter is parsed as prose, so its values are checked with the prose policy instead of the string policy. Configure the option, as in the [README example](../README.md#other-languages), if your Markdown files have front matter.
- **Vue and Svelte.** They are not supported languages. With their ESLint parsers, the markup before the first and after the last script token is checked as text and never fixed, but template expressions are not told apart from markup, and markup between two script blocks is treated as JavaScript code, so `--fix` may replace unusual whitespace there.
- **Parse errors.** A file that fails to parse reports only the parse error; the plugin's rules do not run on it.
- **Unicode version.** Unassigned code points and script membership come from the Unicode version of the running Node.js engine.
