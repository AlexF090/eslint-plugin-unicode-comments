import css from '@eslint/css';
import json from '@eslint/json';
import markdown from '@eslint/markdown';
import html from '@html-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import { Linter } from 'eslint';
import toml from 'eslint-plugin-toml';
import yml from 'eslint-plugin-yml';
import unicodeGuard from '../../src/index.ts';

const recommended = unicodeGuard.configs.recommended;

const forLanguage = (
  files: string[],
  language: string,
  plugins: NonNullable<Linter.Config['plugins']> = {},
): Linter.Config => ({
  files,
  language,
  plugins: { ...plugins, ...recommended.plugins },
  rules: recommended.rules,
});

const configurations: Linter.Config[] = [
  { files: ['**/*.{js,jsx}'], ...recommended },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
  },
  { files: ['**/*.ts'], ...recommended, languageOptions: { parser: tsParser } },
  forLanguage(['**/*.json'], 'json/jsonc', { json }),
  forLanguage(['**/*.md'], 'markdown/gfm', { markdown }),
  {
    files: ['**/*.fm.md'],
    languageOptions: { frontmatter: 'yaml' },
  },
  forLanguage(['**/*.css'], 'css/css', { css }),
  forLanguage(['**/*.yaml'], 'yml/yaml', { yml }),
  forLanguage(['**/*.toml'], 'toml/toml', { toml }),
  forLanguage(['**/*.html'], 'html/html', { html }),
  forLanguage(['**/*.txt', '**/.env'], 'unicode-guard/text'),
  unicodeGuard.configs['ai-instructions'],
];

export interface LintMessageSummary {
  ruleId: string | null;
  line: number;
  column: number;
  message: string;
}

export const lintFile = (
  filename: string,
  code: string,
): LintMessageSummary[] =>
  new Linter()
    .verify(code, configurations, { filename })
    .map(({ ruleId, line, column, message }) => ({
      ruleId,
      line,
      column,
      message,
    }));

export const fixFile = (filename: string, code: string): string =>
  new Linter().verifyAndFix(code, configurations, { filename }).output;

/** The source code object the language of `filename` creates for `code`. */
export const sourceCodeOf = (filename: string, code: string): unknown => {
  const linter = new Linter();
  linter.verify(code, configurations, { filename });
  return linter.getSourceCode();
};
