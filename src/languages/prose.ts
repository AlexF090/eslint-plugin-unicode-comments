import type { UnknownRecord } from '../core/is-record.ts';
import type { ContextRange } from '../core/source-context.ts';
import type { LanguageAdapter } from './language-adapter.ts';
import {
  readArray,
  readOffsets,
  readType,
  toContextRange,
  walkNodes,
} from './syntax-element.ts';

/**
 * Markdown nodes that are strings rather than prose: code and embedded
 * languages, and nodes holding a URL, title, alt text, or reference label.
 * An autofix there could change where a link points or which definition a
 * reference resolves to, so these are never fixed.
 */
const stringTypes = new Set([
  'code',
  'inlineCode',
  'html',
  'yaml',
  'toml',
  'image',
  'imageReference',
  'definition',
]);

/**
 * The visible text of a link is prose, but only when it is written apart
 * from the destination: `[text](url)` and `[text][label]`. In autolinks,
 * collapsed `[label][]`, and shortcut `[label]` references the text is the
 * URL or the label itself.
 */
const hasSeparateLinkText = (
  node: UnknownRecord,
  type: string,
  text: string,
): boolean => {
  if (type === 'linkReference') {
    return node['referenceType'] === 'full';
  }
  const offsets = readOffsets(node);
  return offsets !== undefined && text[offsets[0]] === '[';
};

const collectLinkRanges = (
  node: UnknownRecord,
  type: string,
  text: string,
): ContextRange[] => {
  const linkRange = toContextRange(node, 'string');
  if (linkRange === undefined) {
    return [];
  }
  if (!hasSeparateLinkText(node, type, text)) {
    return [linkRange];
  }
  const childRanges = readArray(node, 'children').flatMap((child) => {
    const childType = readType(child);
    if (childType === undefined || stringTypes.has(childType)) {
      return [];
    }
    const range = toContextRange(child, 'text');
    return range === undefined ? [] : [range];
  });
  return [linkRange, ...childRanges];
};

/**
 * `@eslint/markdown`. Prose is text; code blocks, inline code, embedded
 * HTML, front matter, and link destinations, titles, and labels are strings.
 */
export const markdownAdapter: LanguageAdapter = {
  defaultContext: 'text',
  matches: (ast) => readType(ast) === 'root',
  collectContextRanges: (sourceCode) => {
    const ranges: ContextRange[] = [];
    walkNodes(sourceCode.ast, (node, type) => {
      if (type === 'link' || type === 'linkReference') {
        ranges.push(...collectLinkRanges(node, type, sourceCode.text));
        return;
      }
      if (!stringTypes.has(type)) {
        return;
      }
      const range = toContextRange(node, 'string');
      if (range !== undefined) {
        ranges.push(range);
      }
    });
    return ranges;
  },
};

/** The plugin's own `text` language and any language this plugin does not recognise. */
export const plainTextAdapter: LanguageAdapter = {
  defaultContext: 'text',
  matches: () => true,
  collectContextRanges: () => [],
};
