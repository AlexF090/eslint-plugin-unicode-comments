# no-invisible-characters

Disallow invisible characters that can hide code or instructions from reviewers.

- Recommended: `error`
- Fix: none, not even as a suggestion. Removing the character could join its neighbors into syntax (`$` and `{`, `-` and `->`, or the letters of `eslint-disable`); remove it by hand after checking what it hides.

## Rule details

Reported characters:

- format characters (`\p{Cf}`) and default-ignorable code points (`\p{Default_Ignorable_Code_Point}`): zero width space, zero width joiner and non-joiner, word joiner, soft hyphen, invisible operators, zero width no-break space outside the byte order mark
- Hangul fillers (U+115F, U+1160, U+3164, U+FFA0), BRAILLE PATTERN BLANK (U+2800), KHITAN SMALL SCRIPT FILLER (U+16FE4), and MUSICAL SYMBOL NULL NOTEHEAD (U+1D159), which render blank but are not format characters
- tag characters (U+E0000 - U+E007F), used for ASCII smuggling: the rule decodes them and shows the hidden text in the message
- variation selectors (U+FE00 - U+FE0F, U+E0100 - U+E01EF) that do not follow a valid base character, used to hide payloads (GlassWorm)
- control characters (`\p{Cc}`) except tab, line feed, and a carriage return directly before a line feed, including ESCAPE (terminal escape injection), NEXT LINE, and a lone CARRIAGE RETURN (a terminal returns to the start of the line and overwrites text printed before it)

Runs of adjacent characters are reported as one problem.

### Accepted sequences

In comments, strings, and prose, the rule accepts characters that are part of a legitimate sequence:

- ZERO WIDTH JOINER inside emoji ZWJ sequences (family, profession, and flag emoji), at most three per sequence like the longest RGI sequences
- VARIATION SELECTOR-15/16 directly after a pictographic emoji, and VARIATION SELECTOR-16 in a keycap sequence (`1`, `#`, or `*`, then U+20E3); a selector after a bare digit, `#`, or `*` is reported
- VARIATION SELECTOR-1 to -14 after a base character that StandardizedVariants.txt lists for that selector (standardized variation sequences, such as the CJK compatibility ideographs); any other pair, and any selector after an ASCII character (StandardizedVariants.txt lists DIGIT ZERO), is reported
- the tag sequences of the England, Scotland, and Wales flags
- ZERO WIDTH JOINER and NON-JOINER after a letter (optionally followed by combining marks) and before a letter or mark, when both belong by their Script property to a script that needs joiners for shaping (Arabic, Persian, Syriac, Indic scripts, Khmer, Myanmar, Tibetan, Mongolian); marks shared with Latin, such as U+0951, do not qualify

In code and identifiers, none of these exceptions apply.

Ideographic variation selectors (VS17 to VS256, U+E0100 - U+E01EF) are always reported: one selector after any ideograph can carry a hidden byte, and telling legitimate ideographic variation sequences apart would need the Ideographic Variation Database. If your text uses them, allow them explicitly:

```js
'unicode-guard/no-invisible-characters': ['error', { allow: ['U+E0100..U+E01EF'] }],
```

Examples of **incorrect** code (`<U+3164>` stands for the invisible character):

```js
const { timeout,<U+3164>} = req.query; // hidden second parameter
const ad<U+200D>min = true; // two different identifiers that look the same
// Summarize this file.<U+E0049><U+E0067><U+E006E>... (hidden "Ignore ...")
```

Examples of **correct** code:

```js
const zeroWidthSpace = '\u200B';
const family = '\u{1F468}\u200D\u{1F469}\u200D\u{1F467}'; // typed literally, this emoji sequence is accepted too
```

## Options

```json
{ "allow": ["U+200C"] }
```

See [no-bidi-control](./no-bidi-control.md#options) for the entry format.

## When not to use it

Do not disable this rule. Allow single code points for content that needs them.
