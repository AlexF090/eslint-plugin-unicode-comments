import type { LocatableSourceCode, Position } from './scan-source-code.ts';

const findLineIndex = (
  lineStarts: readonly number[],
  offset: number,
): number => {
  let low = 0;
  let high = lineStarts.length - 1;
  while (low < high) {
    const middle = (low + high + 1) >>> 1;
    if ((lineStarts[middle] ?? 0) <= offset) {
      low = middle;
    } else {
      high = middle - 1;
    }
  }
  return low;
};

const computeLineStarts = (
  text: string,
  lines: readonly string[],
): number[] => {
  const lineStarts: number[] = [];
  let start = 0;
  for (const line of lines) {
    lineStarts.push(start);
    const lineEnd = start + line.length;
    start = lineEnd + (text.startsWith('\r\n', lineEnd) ? 2 : 1);
  }
  return lineStarts;
};

/**
 * Maps offsets to positions in linear total time. The `getLocFromIndex()`
 * of `@eslint/plugin-kit` rescans the rest of the file on every call for
 * offsets on a last line without a line break, which is quadratic for many
 * findings. Lines come from the source code itself, so every language keeps
 * its own line break definition; the position of offset 0 gives the
 * language's first line and column number.
 */
export const createOffsetLocator = (
  sourceCode: LocatableSourceCode,
): ((offset: number) => Position) => {
  const lines: unknown = Reflect.get(sourceCode, 'lines');
  if (
    !Array.isArray(lines) ||
    !lines.every((line) => typeof line === 'string')
  ) {
    return (offset) => sourceCode.getLocFromIndex(offset);
  }
  const lineStarts = computeLineStarts(sourceCode.text, lines);
  const origin = sourceCode.getLocFromIndex(0);
  return (offset) => {
    const lineIndex = findLineIndex(lineStarts, offset);
    return {
      line: origin.line + lineIndex,
      column: origin.column + offset - (lineStarts[lineIndex] ?? 0),
    };
  };
};
