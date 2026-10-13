import { describe, expect, it } from 'vitest';
import { commonScriptConfusables } from '../../src/core/common-script-confusables.ts';

describe('commonScriptConfusables', () => {
  it('only lists characters of no particular script that NFKC does not already map to ASCII', () => {
    expect(commonScriptConfusables.size).toBeGreaterThan(0);
    for (const [codePoint, imitated] of commonScriptConfusables) {
      const character = String.fromCodePoint(codePoint);
      expect(character).toMatch(/^[\p{Script=Common}\p{Script=Inherited}]$/u);
      expect(character.normalize('NFKC')).not.toMatch(/^[\x21-\x7E]$/u);
      expect(imitated).toMatch(/^[\w!#$%&*+\-./:=?@\\~]$/u);
    }
  });

  it('leaves out punctuation that belongs to the prose of other scripts', () => {
    const waveDash = 0x301c;
    const devanagariDanda = 0x0964;
    const arabicTatweel = 0x0640;
    for (const codePoint of [waveDash, devanagariDanda, arabicTatweel]) {
      expect(commonScriptConfusables.has(codePoint)).toBe(false);
    }
  });
});
