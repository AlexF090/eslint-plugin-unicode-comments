import { describe, expect, it } from 'vitest';
import {
  compileAllowList,
  InvalidAllowEntryError,
} from '../../src/core/allow-list.ts';

describe('compileAllowList', () => {
  it('allows nothing for an empty list', () => {
    expect(compileAllowList([])('a')).toBe(false);
  });

  it('accepts literal characters, including astral ones', () => {
    const isAllowed = compileAllowList(['\u00E4', '\u{1F600}']);
    expect(isAllowed('\u00E4')).toBe(true);
    expect(isAllowed('\u{1F600}')).toBe(true);
    expect(isAllowed('\u00F6')).toBe(false);
  });

  it('accepts code points and inclusive ranges in any letter case', () => {
    const isAllowed = compileAllowList(['U+00a0', 'u+0400..U+04FF']);
    expect(isAllowed('\u00A0')).toBe(true);
    expect(isAllowed('\u0400')).toBe(true);
    expect(isAllowed('\u04FF')).toBe(true);
    expect(isAllowed('\u0500')).toBe(false);
  });

  it('accepts Unicode property escapes', () => {
    const isAllowed = compileAllowList(['\\p{Script=Greek}']);
    expect(isAllowed('\u03B1')).toBe(true);
    expect(isAllowed('a')).toBe(false);
  });

  it('does not let entries inject regular expression syntax', () => {
    const isAllowed = compileAllowList(['^', ']', '-', '\\']);
    expect(isAllowed('^')).toBe(true);
    expect(isAllowed(']')).toBe(true);
    expect(isAllowed('a')).toBe(false);
  });

  it.each([
    ['ab', 'unrecognized format'],
    ['', 'unrecognized format'],
    ['U+110000', 'above U+10FFFF'],
    ['U+0500..U+0400', 'range start is above range end'],
    ['\\p{Script=Klingon}', 'unknown Unicode property'],
  ])('rejects %j with a descriptive error', (entry, reason) => {
    expect(() => compileAllowList([entry])).toThrow(InvalidAllowEntryError);
    expect(() => compileAllowList([entry])).toThrow(reason);
  });
});
