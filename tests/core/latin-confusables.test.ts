import { describe, expect, it } from 'vitest';
import { latinConfusables } from '../../src/core/latin-confusables.ts';

describe('latinConfusables', () => {
  it('only lists Latin characters that NFKC does not already map to ASCII', () => {
    expect(latinConfusables.size).toBeGreaterThan(0);
    for (const [codePoint, imitated] of latinConfusables) {
      const character = String.fromCodePoint(codePoint);
      expect(character).toMatch(/^\p{Script=Latin}$/u);
      expect(character.normalize('NFKC')).not.toMatch(/^[\x21-\x7E]$/u);
      expect(imitated).toMatch(/^[\x21-\x7E]{1,4}$/u);
    }
  });

  it('lists letters that imitate several ASCII characters but not French ligatures', () => {
    expect(latinConfusables.get(0xa74f)).toBe('oo');
    expect(latinConfusables.get(0x01c1)).toBe('ll');
    expect(latinConfusables.has(0x0153)).toBe(false);
  });
});
