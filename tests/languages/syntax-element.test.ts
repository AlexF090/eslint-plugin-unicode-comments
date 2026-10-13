import { describe, expect, it } from 'vitest';
import {
  readArray,
  readOffsets,
  readType,
  toContextRange,
} from '../../src/languages/syntax-element.ts';

describe('readOffsets', () => {
  it.each([
    ['a range pair', { range: [2, 5] }, [2, 5]],
    [
      'CSS locations',
      { loc: { start: { offset: 1 }, end: { offset: 4 } } },
      [1, 4],
    ],
    [
      'Markdown positions',
      { position: { start: { offset: 0 }, end: { offset: 3 } } },
      [0, 3],
    ],
  ])('reads %s', (_name, element, offsets) => {
    expect(readOffsets(element)).toEqual(offsets);
  });

  it.each([
    ['a primitive', 'text'],
    ['an incomplete range', { range: [1] }],
    ['a location without offsets', { loc: { start: { line: 1 }, end: {} } }],
    ['a location that is not an object', { loc: 'start' }],
    ['a position whose edges are missing', { position: {} }],
  ])('returns undefined for %s', (_name, element) => {
    expect(readOffsets(element)).toBeUndefined();
  });
});

describe('element readers', () => {
  it('reads string types only', () => {
    expect(readType({ type: 'Program' })).toBe('Program');
    expect(readType({ type: 1 })).toBeUndefined();
    expect(readType(undefined)).toBeUndefined();
  });

  it('reads arrays only', () => {
    expect(readArray({ tokens: [1] }, 'tokens')).toEqual([1]);
    expect(readArray({ tokens: 'none' }, 'tokens')).toEqual([]);
    expect(readArray(null, 'tokens')).toEqual([]);
  });

  it('builds no context range for an element without offsets', () => {
    expect(toContextRange({}, 'comment')).toBeUndefined();
  });
});
