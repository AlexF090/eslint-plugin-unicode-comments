import type { Plugin } from '@eslint/core';
import { attachPlugin, createConfigs, PLUGIN_NAMESPACE } from './configs.ts';
import { textLanguage } from './languages/text-language.ts';
import { readPackageMetadata } from './package-metadata.ts';
import { allowedCharacters } from './rules/allowed-characters.ts';
import { noBidiControl } from './rules/no-bidi-control.ts';
import { noConfusableCharacters } from './rules/no-confusable-characters.ts';
import { noInvisibleCharacters } from './rules/no-invisible-characters.ts';
import { noPrivateUseOrUnassignedCharacters } from './rules/no-private-use-or-unassigned-characters.ts';
import { noTypographicCharacters } from './rules/no-typographic-characters.ts';
import { noUnusualWhitespace } from './rules/no-unusual-whitespace.ts';

const { name, version } = readPackageMetadata();

const rules = {
  'allowed-characters': allowedCharacters,
  'no-bidi-control': noBidiControl,
  'no-confusable-characters': noConfusableCharacters,
  'no-invisible-characters': noInvisibleCharacters,
  'no-private-use-or-unassigned-characters': noPrivateUseOrUnassignedCharacters,
  'no-typographic-characters': noTypographicCharacters,
  'no-unusual-whitespace': noUnusualWhitespace,
};

const configs = createConfigs();

const plugin = {
  meta: { name, version, namespace: PLUGIN_NAMESPACE },
  rules,
  languages: { text: textLanguage },
  configs,
} satisfies Plugin;

attachPlugin(configs, plugin);

export default plugin;

// Lets CommonJS configuration files use `require('eslint-plugin-unicode-guard')` without `.default`.
export { plugin as 'module.exports' };
