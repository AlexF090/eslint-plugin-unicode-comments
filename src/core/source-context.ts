export const sourceContexts = [
  'code',
  'identifier',
  'comment',
  'string',
  'text',
] as const;

export type SourceContext = (typeof sourceContexts)[number];

export interface ContextRange {
  start: number;
  end: number;
  context: SourceContext;
}

/** Whether vetted sequences (emoji, joiners in joining scripts) are accepted in `context`: comments, strings, and text, not code or identifiers. */
export const acceptsVettedSequences = (context: SourceContext): boolean =>
  context === 'comment' || context === 'string' || context === 'text';

/**
 * Turns possibly nested ranges into sorted, non-overlapping segments. When
 * ranges overlap, the range that starts later wins for the overlapping part,
 * so a nested range (a string inside a JSX expression inside JSX text)
 * overrides its container.
 */
const flattenRanges = (ranges: readonly ContextRange[]): ContextRange[] => {
  const sortedRanges = ranges
    .filter((range) => range.end > range.start)
    .sort((left, right) => left.start - right.start);
  const segments: ContextRange[] = [];

  for (const range of sortedRanges) {
    const displacedTails: ContextRange[] = [];
    let last = segments.at(-1);
    while (last !== undefined && last.end > range.start) {
      segments.pop();
      if (last.start < range.start) {
        segments.push({ ...last, end: range.start });
      }
      if (last.end > range.end) {
        displacedTails.unshift({
          ...last,
          start: Math.max(last.start, range.end),
        });
      }
      last = last.start < range.start ? undefined : segments.at(-1);
    }
    segments.push({ ...range });
    segments.push(...displacedTails);
  }
  return segments;
};

export const createContextResolver = (
  ranges: readonly ContextRange[],
  defaultContext: SourceContext,
): ((offset: number) => SourceContext) => {
  const segments = flattenRanges(ranges);

  return (offset) => {
    let low = 0;
    let high = segments.length - 1;
    while (low <= high) {
      const middle = (low + high) >>> 1;
      const segment = segments[middle];
      if (segment === undefined) {
        break;
      }
      if (offset < segment.start) {
        high = middle - 1;
      } else if (offset >= segment.end) {
        low = middle + 1;
      } else {
        return segment.context;
      }
    }
    return defaultContext;
  };
};
