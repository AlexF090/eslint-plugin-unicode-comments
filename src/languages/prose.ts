import type { ContextRange } from '../core/source-context.ts';
import type { LanguageAdapter } from './language-adapter.ts';
import { readType, toContextRange, walkNodes } from './syntax-element.ts';

/** Markdown nodes holding code or embedded languages rather than prose. */
const embeddedCodeTypes = new Set([
  'code',
  'inlineCode',
  'html',
  'yaml',
  'toml',
]);

/** `@eslint/markdown`. Prose is text; code blocks, inline code, embedded HTML, and front matter are strings. */
export const markdownAdapter: LanguageAdapter = {
  name: 'Markdown',
  defaultContext: 'text',
  fixesText: true,
  matches: (ast) => readType(ast) === 'root',
  collectContextRanges: (sourceCode) => {
    const ranges: ContextRange[] = [];
    walkNodes(sourceCode.ast, (node, type) => {
      if (!embeddedCodeTypes.has(type)) {
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
  name: 'plain text',
  defaultContext: 'text',
  matches: () => true,
  collectContextRanges: () => [],
};
