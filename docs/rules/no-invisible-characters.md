# no-invisible-characters

Disallow invisible characters that can hide code or instructions from reviewers.

- Recommended: `error`
- Suggestions: remove the character

## Rule details

Reported characters:

- format characters (`\p{Cf}`) and default-ignorable code points (`\p{Default_Ignorable_Code_Point}`): zero width space, zero width joiner and non-joiner, word joiner, soft hyphen, invisible operators, zero width no-break space outside the byte order mark
- Hangul fillers (U+115F, U+1160, U+3164, U+FFA0) and BRAILLE PATTERN BLANK (U+2800), which are invisible but valid in identifiers
- tag characters (U+E0000 - U+E007F), used for ASCII smuggling: the rule decodes them and shows the hidden text in the message
- variation selectors (U+FE00 - U+FE0F, U+E0100 - U+E01EF) that do not follow a valid base character, used to hide payloads (GlassWorm)
- control characters (`\p{Cc}`) except tab, line feed, and carriage return, including ESCAPE (terminal escape injection) and NEXT LINE

Runs of adjacent characters are reported as one problem.

### Accepted sequences

In comments, strings, and prose, the rule accepts characters that are part of a legitimate sequence:

- ZERO WIDTH JOINER inside emoji ZWJ sequences (family, profession, and flag emoji)
- VARIATION SELECTOR-15/16 directly after an emoji, including keycaps
- one variation selector after a CJK ideograph (standardized and ideographic variation sequences)
- the tag sequences of the England, Scotland, and Wales flags
- ZERO WIDTH JOINER and NON-JOINER between two letters of scripts that need them for shaping (Arabic, Persian, Syriac, Indic scripts, Khmer, Myanmar, Tibetan, Mongolian)

In code and identifiers, none of these exceptions apply.

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
