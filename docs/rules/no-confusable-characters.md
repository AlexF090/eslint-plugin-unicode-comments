# no-confusable-characters

Disallow characters that imitate ASCII and words that mix scripts.

- Recommended: `error`
- Suggestions: replace a lookalike with the ASCII character it imitates

## Rule details

The rule reports two shapes of homograph attack.

**Lookalikes** are characters whose NFKC normalization is a single printable ASCII character: fullwidth forms (U+FF01 - U+FF5E), mathematical alphanumeric symbols (U+1D400 - U+1D7FF), Roman numerals, and letterlike symbols. Characters below U+0100 (such as the ordinal indicators), other numbers such as superscript digits, and emoji are not reported.

**Mixed-script words** are words that combine letters from more than one script, such as a Latin word containing a Cyrillic `a`. Following the "Highly Restrictive" level of [UTS #39](https://www.unicode.org/reports/tr39/), a word may use one script, or Latin together with Han, Hiragana, and Katakana, Han and Bopomofo, or Han and Hangul. The rule reports the letters outside the word's dominant script; on a tie, Latin is treated as dominant. ASCII letters inside a Cyrillic or Greek word are reported too.

Whole-script confusables, such as a word written entirely in Cyrillic that reads like a Latin word, are not detected in comments and strings. In code and identifiers, [allowed-characters](./allowed-characters.md) rejects them because only ASCII is allowed there.

Examples of **incorrect** code (`<U+0430>` stands for CYRILLIC SMALL LETTER A):

```js
function is<U+0430>dmin() {
  return true;
}
const role = '<U+FF41>dmin'; // FULLWIDTH LATIN SMALL LETTER A
```

Examples of **correct** code:

```js
// Gruesse, cafe, and Cyrillic, Greek, or Japanese words in a single script are fine.
// A Japanese label that mixes Latin, Hiragana, and Katakana is accepted as well.
```

## Options

```json
{ "allow": ["U+FF10..U+FF19"] }
```

See [no-bidi-control](./no-bidi-control.md#options) for the entry format.
