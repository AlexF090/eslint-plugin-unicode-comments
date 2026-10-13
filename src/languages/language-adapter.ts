import type { ContextRange, SourceContext } from '../core/source-context.ts';

/** The part of an ESLint `SourceCode` object that language adapters read. */
export interface ScannableSourceCode {
  text: string;
  ast: unknown;
}

export interface LanguageAdapter {
  /** Language name used in documentation and error messages. */
  name: string;
  matches(ast: unknown): boolean;
  collectContextRanges(sourceCode: ScannableSourceCode): ContextRange[];
  /** Context of text that no collected range covers. */
  defaultContext: SourceContext;
  /**
   * Whether autofixes may rewrite characters in `text` context. Only true
   * for languages whose text is prose; rendered text (JSX, HTML) and files
   * of unknown structure only get suggestions.
   */
  fixesText?: boolean;
}
