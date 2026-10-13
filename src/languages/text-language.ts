import type {
  File,
  Language,
  LanguageOptions,
  OkParseResult,
  ParseResult,
  SourceLocation,
} from '@eslint/core';
import { TextSourceCodeBase, VisitNodeStep } from '@eslint/plugin-kit';
import { qualifyName } from '../plugin-namespace.ts';

/**
 * A minimal ESLint language that treats a file as plain text, so files
 * without an ESLint parser (`.cursorrules`, `.env`, shell scripts,
 * Dockerfiles, Python, ...) can be linted by this plugin's rules. The AST is a
 * single `TextDocument` node spanning the whole file.
 */

export const TEXT_DOCUMENT_TYPE = 'TextDocument';

export interface TextDocumentNode {
  type: typeof TEXT_DOCUMENT_TYPE;
  range: [number, number];
  loc: SourceLocation;
}

const LINE_ENDING_PATTERN = /\r\n|[\r\n]/u;
const LINE_START = 1;
const COLUMN_START = 1;

const createTextDocument = (text: string): TextDocumentNode => {
  const lines = text.split(LINE_ENDING_PATTERN);
  const lastLine = lines.at(-1) ?? '';
  return {
    type: TEXT_DOCUMENT_TYPE,
    range: [0, text.length],
    loc: {
      start: { line: LINE_START, column: COLUMN_START },
      end: {
        line: lines.length - 1 + LINE_START,
        column: lastLine.length + COLUMN_START,
      },
    },
  };
};

interface PlainTextSourceCodeTypeOptions {
  LangOptions: LanguageOptions;
  RootNode: TextDocumentNode;
  SyntaxElementWithLoc: TextDocumentNode;
  ConfigNode: never;
}

export class PlainTextSourceCode extends TextSourceCodeBase<PlainTextSourceCodeTypeOptions> {
  constructor(text: string, ast: TextDocumentNode) {
    super({ text, ast, lineEndingPattern: LINE_ENDING_PATTERN });
  }

  override getParent(): undefined {
    return undefined;
  }

  override traverse(): Iterable<VisitNodeStep> {
    const ENTER = 1;
    const EXIT = 2;
    return [
      new VisitNodeStep({ target: this.ast, phase: ENTER, args: [this.ast] }),
      new VisitNodeStep({ target: this.ast, phase: EXIT, args: [this.ast] }),
    ];
  }
}

const readBody = (file: File): string | undefined =>
  typeof file.body === 'string' ? file.body : undefined;

const requireTextBody = (file: File): string => {
  const text = readBody(file);
  if (text === undefined) {
    throw new TypeError(
      `${qualifyName('text')}: the body of ${file.path} is not text, so no source code can be created for it.`,
    );
  }
  return text;
};

export const textLanguage: Language<{
  LangOptions: LanguageOptions;
  Code: PlainTextSourceCode;
  RootNode: TextDocumentNode;
  Node: TextDocumentNode;
}> = {
  fileType: 'text',
  lineStart: LINE_START,
  columnStart: COLUMN_START,
  nodeTypeKey: 'type',
  visitorKeys: { [TEXT_DOCUMENT_TYPE]: [] },
  validateLanguageOptions: () => {},
  parse: (file): ParseResult<TextDocumentNode> => {
    const text = readBody(file);
    if (text === undefined) {
      return {
        ok: false,
        errors: [
          { message: 'Expected the file body to be text.', line: 1, column: 1 },
        ],
      };
    }
    return { ok: true, ast: createTextDocument(text) };
  },
  createSourceCode: (file, input: OkParseResult<TextDocumentNode>) =>
    new PlainTextSourceCode(requireTextBody(file), input.ast),
};
