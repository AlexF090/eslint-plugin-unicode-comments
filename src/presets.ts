import type { ConfigObject, Plugin, RulesConfig } from '@eslint/core';
import { PLUGIN_NAMESPACE } from './plugin-namespace.ts';
import { strictContextPolicy } from './rules/allowed-characters.ts';

/**
 * Instruction and rule files read by AI coding assistants. Hidden Unicode in
 * these files is a prompt-injection vector ("Rules File Backdoor"), so the
 * `ai-instructions` preset lints them as plain text with the strict policy.
 */
export const aiInstructionFiles = [
  '**/AGENTS.md',
  '**/CLAUDE.md',
  '**/CLAUDE.local.md',
  '**/GEMINI.md',
  '**/.claude/**/*.md',
  '**/.cursorrules',
  '**/.cursor/rules/**',
  '**/*.mdc',
  '**/.windsurfrules',
  '**/.windsurf/rules/**',
  '**/.clinerules',
  '**/.clinerules/**',
  '**/.roo/rules/**',
  '**/.kiro/steering/**',
  '**/.github/copilot-instructions.md',
  '**/.github/instructions/**',
  '**/.github/prompts/**',
  '**/*.prompt.md',
  '**/*.instructions.md',
];

const rule = (name: string): string => `${PLUGIN_NAMESPACE}/${name}`;

const securityRules: RulesConfig = {
  [rule('no-bidi-control')]: 'error',
  [rule('no-invisible-characters')]: 'error',
  [rule('no-private-use-or-unassigned-characters')]: 'error',
  [rule('no-confusable-characters')]: 'error',
};

export const recommendedRules: RulesConfig = {
  ...securityRules,
  [rule('no-unusual-whitespace')]: 'error',
  [rule('no-typographic-characters')]: 'warn',
  [rule('allowed-characters')]: 'error',
};

export const strictRules: RulesConfig = {
  ...securityRules,
  [rule('no-unusual-whitespace')]: 'error',
  [rule('no-typographic-characters')]: 'error',
  [rule('allowed-characters')]: ['error', strictContextPolicy],
};

export const relaxedRules: RulesConfig = {
  ...securityRules,
  [rule('no-unusual-whitespace')]: 'warn',
};

export interface PresetConfiguration extends ConfigObject {
  name: string;
  rules: RulesConfig;
}

// A type alias rather than an interface: only object literal types get the
// implicit index signature that makes them assignable to `Plugin['configs']`.
export type PluginPresets = {
  recommended: PresetConfiguration;
  strict: PresetConfiguration;
  relaxed: PresetConfiguration;
  'ai-instructions': PresetConfiguration;
};

/**
 * Creates the presets. Their `plugins` entry must reference the exported
 * plugin object itself (ESLint rejects two different objects under one
 * namespace), so it is attached by `attachPlugin` once the plugin exists.
 */
export const createPresets = (): PluginPresets => {
  return {
    recommended: {
      name: `${PLUGIN_NAMESPACE}/recommended`,
      rules: recommendedRules,
    },
    strict: {
      name: `${PLUGIN_NAMESPACE}/strict`,
      rules: strictRules,
    },
    relaxed: {
      name: `${PLUGIN_NAMESPACE}/relaxed`,
      rules: relaxedRules,
    },
    'ai-instructions': {
      name: `${PLUGIN_NAMESPACE}/ai-instructions`,
      files: aiInstructionFiles,
      language: `${PLUGIN_NAMESPACE}/text`,
      rules: strictRules,
    },
  };
};

export const attachPlugin = (presets: PluginPresets, plugin: Plugin): void => {
  for (const preset of Object.values(presets)) {
    preset.plugins = { [PLUGIN_NAMESPACE]: plugin };
  }
};
