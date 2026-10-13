import { isRecord, type UnknownRecord } from '../core/is-record.ts';
import type { ContextRange, SourceContext } from '../core/source-context.ts';

/**
 * Helpers for reading tokens, comments, and nodes from the ASTs of different
 * ESLint languages without depending on their packages. Every language
 * plugin uses its own node shape, so values are inspected structurally.
 */

const isOffsetPair = (value: unknown): value is [number, number] =>
  Array.isArray(value) &&
  value.length === 2 &&
  typeof value[0] === 'number' &&
  typeof value[1] === 'number';

const readLocationOffset = (
  location: unknown,
  edge: 'start' | 'end',
): number | undefined => {
  if (!isRecord(location)) {
    return undefined;
  }
  const position = location[edge];
  if (!isRecord(position)) {
    return undefined;
  }
  const offset = position['offset'];
  return typeof offset === 'number' ? offset : undefined;
};

/** `[start, end)` offsets from `range`, `loc.*.offset` (CSS), or `position.*.offset` (Markdown). */
export const readOffsets = (element: unknown): [number, number] | undefined => {
  if (!isRecord(element)) {
    return undefined;
  }
  if (isOffsetPair(element['range'])) {
    return element['range'];
  }
  for (const key of ['loc', 'position']) {
    const start = readLocationOffset(element[key], 'start');
    const end = readLocationOffset(element[key], 'end');
    if (start !== undefined && end !== undefined) {
      return [start, end];
    }
  }
  return undefined;
};

export const readType = (element: unknown): string | undefined => {
  if (!isRecord(element)) {
    return undefined;
  }
  const type = element['type'];
  return typeof type === 'string' ? type : undefined;
};

export const readArray = (owner: unknown, key: string): unknown[] => {
  if (!isRecord(owner)) {
    return [];
  }
  const value = owner[key];
  return Array.isArray(value) ? value : [];
};

export const toContextRange = (
  element: unknown,
  context: SourceContext,
): ContextRange | undefined => {
  const offsets = readOffsets(element);
  return offsets === undefined
    ? undefined
    : { start: offsets[0], end: offsets[1], context };
};

/** Context ranges for every element whose type maps to a context. */
export const mapElementsToRanges = (
  elements: readonly unknown[],
  contextForType: (type: string) => SourceContext | undefined,
): ContextRange[] =>
  elements.flatMap((element) => {
    const type = readType(element);
    const context = type === undefined ? undefined : contextForType(type);
    const range =
      context === undefined ? undefined : toContextRange(element, context);
    return range === undefined ? [] : [range];
  });

const NON_CHILD_KEYS = new Set([
  'parent',
  'loc',
  'range',
  'position',
  'tokens',
  'comments',
]);

/** Depth-first walk over every object with a `type` property below `root`. */
export const walkNodes = (
  root: unknown,
  visit: (node: UnknownRecord, type: string) => void,
): void => {
  const pending: unknown[] = [root];
  while (pending.length > 0) {
    const current = pending.pop();
    if (Array.isArray(current)) {
      pending.push(...current);
      continue;
    }
    if (!isRecord(current)) {
      continue;
    }
    const type = readType(current);
    if (type !== undefined) {
      visit(current, type);
    }
    for (const [key, value] of Object.entries(current)) {
      if (!NON_CHILD_KEYS.has(key) && typeof value === 'object') {
        pending.push(value);
      }
    }
  }
};

/**
 * All comments a language exposes: `getAllComments()` (JavaScript, YAML,
 * TOML), `sourceCode.comments` (JSON, CSS), or `ast.comments` (HTML).
 */
export const readComments = (sourceCode: object, ast: unknown): unknown[] => {
  const getAllComments: unknown = Reflect.get(sourceCode, 'getAllComments');
  const fromMethod: unknown =
    typeof getAllComments === 'function'
      ? Reflect.apply(getAllComments, sourceCode, [])
      : undefined;
  const fromSourceCode: unknown = Reflect.get(sourceCode, 'comments');
  return [
    ...(Array.isArray(fromMethod) ? fromMethod : []),
    ...(Array.isArray(fromSourceCode) ? fromSourceCode : []),
    ...readArray(ast, 'comments'),
  ];
};

/** A `comment` context range for every comment the language exposes. */
export const collectCommentRanges = (sourceCode: {
  ast: unknown;
}): ContextRange[] =>
  mapElementsToRanges(
    readComments(sourceCode, sourceCode.ast),
    () => 'comment',
  );
