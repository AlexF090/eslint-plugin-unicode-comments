import { cssAdapter } from './css.ts';
import { htmlAdapter } from './html.ts';
import { javascriptAdapter } from './javascript.ts';
import { jsonAdapter } from './json.ts';
import type { LanguageAdapter } from './language-adapter.ts';
import { markdownAdapter, plainTextAdapter } from './prose.ts';
import { tomlAdapter } from './toml.ts';
import { yamlAdapter } from './yaml.ts';

// Order matters: YAML, TOML, and HTML roots are also `Program` nodes with
// tokens, so they must be checked before the JavaScript adapter.
const adapters: readonly LanguageAdapter[] = [
  yamlAdapter,
  tomlAdapter,
  htmlAdapter,
  javascriptAdapter,
  jsonAdapter,
  cssAdapter,
  markdownAdapter,
];

export const resolveLanguageAdapter = (ast: unknown): LanguageAdapter =>
  adapters.find((adapter) => adapter.matches(ast)) ?? plainTextAdapter;
