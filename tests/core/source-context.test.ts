import { describe, expect, it } from 'vitest';
import {
  createContextResolver,
  type ContextRange,
} from '../../src/core/source-context.ts';

describe('createContextResolver', () => {
  it('returns the default context when no range covers the offset', () => {
    const resolve = createContextResolver([], 'code');
    expect(resolve(0)).toBe('code');
  });

  it('resolves offsets inside, at the start, and at the exclusive end of a range', () => {
    const resolve = createContextResolver(
      [{ start: 2, end: 5, context: 'string' }],
      'code',
    );
    expect(resolve(1)).toBe('code');
    expect(resolve(2)).toBe('string');
    expect(resolve(4)).toBe('string');
    expect(resolve(5)).toBe('code');
  });

  it('lets a nested range override its container on both sides', () => {
    const ranges: ContextRange[] = [
      { start: 0, end: 20, context: 'text' },
      { start: 5, end: 10, context: 'code' },
      { start: 7, end: 8, context: 'string' },
    ];
    const resolve = createContextResolver(ranges, 'identifier');
    expect(resolve(4)).toBe('text');
    expect(resolve(5)).toBe('code');
    expect(resolve(7)).toBe('string');
    expect(resolve(8)).toBe('code');
    expect(resolve(10)).toBe('text');
    expect(resolve(19)).toBe('text');
    expect(resolve(20)).toBe('identifier');
  });

  it('accepts unsorted input and ignores empty ranges', () => {
    const resolve = createContextResolver(
      [
        { start: 10, end: 12, context: 'comment' },
        { start: 3, end: 3, context: 'string' },
        { start: 0, end: 2, context: 'identifier' },
      ],
      'code',
    );
    expect(resolve(0)).toBe('identifier');
    expect(resolve(3)).toBe('code');
    expect(resolve(11)).toBe('comment');
  });
});
