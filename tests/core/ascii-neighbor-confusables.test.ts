import { describe, expect, it } from 'vitest';
import { asciiNeighborConfusables } from '../../src/core/ascii-neighbor-confusables.ts';

describe('asciiNeighborConfusables', () => {
  it('only lists characters of no particular script or of a CJK script that NFKC does not already map to ASCII', () => {
    expect(asciiNeighborConfusables.size).toBeGreaterThan(0);
    for (const [codePoint, imitated] of asciiNeighborConfusables) {
      const character = String.fromCodePoint(codePoint);
      expect(character).toMatch(
        /^[\p{Script=Common}\p{Script=Inherited}\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\p{Script=Bopomofo}]$/u,
      );
      expect(character.normalize('NFKC')).not.toMatch(/^[\x21-\x7E]$/u);
      expect(imitated).toMatch(/^[\w!#$%&*+\-./:=?@\\~]$/u);
    }
  });

  it('leaves out punctuation that belongs to the prose of other scripts', () => {
    const waveDash = 0x301c;
    const devanagariDanda = 0x0964;
    const arabicTatweel = 0x0640;
    for (const codePoint of [waveDash, devanagariDanda, arabicTatweel]) {
      expect(asciiNeighborConfusables.has(codePoint)).toBe(false);
    }
  });
});
