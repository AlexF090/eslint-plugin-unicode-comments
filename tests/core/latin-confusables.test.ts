import { describe, expect, it } from 'vitest';
import { latinConfusables } from '../../src/core/latin-confusables.ts';

describe('latinConfusables', () => {
  it('only lists Latin characters that NFKC does not already map to ASCII', () => {
    expect(latinConfusables.size).toBeGreaterThan(0);
    for (const [codePoint, imitated] of latinConfusables) {
      const character = String.fromCodePoint(codePoint);
      expect(character).toMatch(/^\p{Script=Latin}$/u);
      expect(character.normalize('NFKC')).not.toMatch(/^[\x21-\x7E]$/u);
      expect(imitated).toMatch(/^[\x21-\x7E]$/u);
    }
  });
});
