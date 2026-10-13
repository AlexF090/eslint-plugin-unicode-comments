# no-confusable-characters

Disallow characters that imitate ASCII and words that mix scripts.

- Recommended: `error`
- Suggestions: replace a lookalike with the ASCII character it imitates

## Rule details

The rule reports two shapes of homograph attack.

**Lookalikes** are characters whose NFKC normalization is a single printable ASCII character: fullwidth forms (U+FF01 - U+FF5E), mathematical alphanumeric symbols (U+1D400 - U+1D7FF), Roman numerals, and letterlike symbols. Characters below U+0100 (such as the ordinal indicators), other numbers such as superscript digits, and emoji are not reported.

Latin letters that NFKC keeps as they are but that [UTS #39](https://www.unicode.org/reports/tr39/) lists as confusable with an ASCII character are lookalikes too, for example LATIN SMALL LETTER DOTLESS I (U+0131) for `i`, LATIN SMALL LETTER ALPHA (U+0251) for `a`, and LATIN SMALL LETTER SCRIPT G (U+0261) for `g`. They stay in the Latin script, so mixed-script detection cannot catch them. The list is generated from the Unicode data files by `npm run generate:unicode-data`.

Characters of no particular script (Common or Inherited) that UTS #39 lists as confusable with an ASCII letter, digit, or URL character are lookalikes when they stand next to such an ASCII character, for example DIVISION SLASH (U+2215) and MODIFIER LETTER COLON (U+A789) in `https<U+A789><U+2215><U+2215>example.com`, or MATHEMATICAL BOLD SMALL ALPHA in a word. Standing alone, as in `a <U+2215> b`, they are not reported, so math with spaces and punctuation of other scripts stay allowed. This list is generated as well.

Some of these letters are ordinary letters in a natural language, such as the dotless i in Turkish and Azerbaijani. Allow them where you write those languages:

```js
'unicode-guard/no-confusable-characters': ['error', { allow: ['U+0131'] }],
```

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
