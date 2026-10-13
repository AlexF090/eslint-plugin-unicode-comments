import { describe, expect, it } from 'vitest';
import { standardizedVariationSequences } from '../../src/core/standardized-variation-sequences.ts';

describe('standardizedVariationSequences', () => {
  it('only lists variation selectors 1 to 16 and the Mongolian free variation selectors', () => {
    expect(standardizedVariationSequences.size).toBeGreaterThan(0);
    for (const selectors of standardizedVariationSequences.values()) {
      expect(selectors.length).toBeGreaterThan(0);
      for (const selector of selectors) {
        const isMongolianSelector =
          (selector >= 0x180b && selector <= 0x180d) || selector === 0x180f;
        const isStandardizedSelector = selector >= 0xfe00 && selector <= 0xfe0f;
        expect(isMongolianSelector || isStandardizedSelector).toBe(true);
      }
    }
  });

  it('lists the CJK compatibility variants of an ideograph', () => {
    expect(standardizedVariationSequences.get(0x6f22)).toEqual([
      0xfe00, 0xfe01,
    ]);
  });

  it('lists the Mongolian free variation selector pairs', () => {
    expect(standardizedVariationSequences.get(0x1820)).toContain(0x180b);
  });
});
