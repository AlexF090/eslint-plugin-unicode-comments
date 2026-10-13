import { describe, expect, it } from 'vitest';
import { standardizedVariationSequences } from '../../src/core/standardized-variation-sequences.ts';

describe('standardizedVariationSequences', () => {
  it('only lists variation selectors 1 to 16', () => {
    expect(standardizedVariationSequences.size).toBeGreaterThan(0);
    for (const selectors of standardizedVariationSequences.values()) {
      expect(selectors.length).toBeGreaterThan(0);
      for (const selector of selectors) {
        expect(selector).toBeGreaterThanOrEqual(0xfe00);
        expect(selector).toBeLessThanOrEqual(0xfe0f);
      }
    }
  });

  it('lists the CJK compatibility variants of an ideograph', () => {
    expect(standardizedVariationSequences.get(0x6f22)).toEqual([
      0xfe00, 0xfe01,
    ]);
  });
});
