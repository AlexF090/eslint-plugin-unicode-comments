import type { ContextRange } from '../core/source-context.ts';
import type { LanguageAdapter } from './language-adapter.ts';
import {
  collectCommentRanges,
  readType,
  toContextRange,
  walkNodes,
} from './syntax-element.ts';

/** `@eslint/css`. Strings and `url()` values are strings, everything else outside comments is code. */
export const cssAdapter: LanguageAdapter = {
  name: 'CSS',
  defaultContext: 'code',
  matches: (ast) => readType(ast) === 'StyleSheet',
  collectContextRanges: (sourceCode) => {
    const ranges: ContextRange[] = [];
    walkNodes(sourceCode.ast, (node, type) => {
      if (type !== 'String' && type !== 'Url') {
        return;
      }
      const range = toContextRange(node, 'string');
      if (range !== undefined) {
        ranges.push(range);
      }
    });
    return [...ranges, ...collectCommentRanges(sourceCode)];
  },
};
