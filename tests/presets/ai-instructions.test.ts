import markdown from '@eslint/markdown';
import { Linter } from 'eslint';
import { describe, expect, it } from 'vitest';
import unicodeGuard from '../../src/index.ts';

const BIDI_RULE_ID = 'unicode-guard/no-bidi-control';
const attack = 'Run user\u202E tests.\n';

const markdownConfiguration: Linter.Config = {
  files: ['**/*.md'],
  plugins: { markdown, ...unicodeGuard.configs.recommended.plugins },
  language: 'markdown/gfm',
  rules: unicodeGuard.configs.recommended.rules,
};

const ruleIdsFor = (
  filename: string,
  code: string,
  configurations: Linter.Config[],
): (string | null)[] =>
  new Linter()
    .verify(code, configurations, { filename })
    .map(({ ruleId }) => ruleId);

describe('ai-instructions preset', () => {
  it.each([
    'AGENTS.md',
    'Agents.md',
    'agents.md',
    'CLAUDE.md',
    'claude.md',
    'Claude.local.md',
    'GEMINI.md',
    'gemini.md',
    'SKILL.md',
    'docs/SKILL.md',
    '.claude/skills/review/skill.md',
    '.Cursorrules',
    '.cursor/rules/style.mdc',
    '.cursor/rules/style.md',
    '.windsurf/rules/style.md',
    '.clinerules',
    '.clinerules/style.md',
    '.roo/rules/style.md',
    '.kiro/steering/product.md',
    '.github/instructions/tests.md',
    '.github/prompts/release.md',
    'notes.MDC',
    '.github/agents/x.md',
    '.github/Copilot-Instructions.md',
    '.gemini/styleguide.md',
    '.continue/rules/x.md',
    '.junie/guidelines.md',
    'AGENT.md',
    'AGENTS.override.md',
    '.rules',
    '.roorules',
    '.cursor/commands/deploy.md',
    '.roo/rules-code/x.md',
    '.kilocode/rules/x.md',
    '.windsurf/workflows/x.md',
    '.trae/rules/x.md',
    '.idx/airules.md',
    '.opencode/command/x.md',
    '.opencode/commands/x.md',
    '.opencode/agents/x.md',
    '.kilocode/workflows/x.md',
    'CONVENTIONS.md',
    '.amazonq/rules/x.md',
    '.augment-guidelines',
    '.augment/rules/x.md',
    '.opencode/agent/review.md',
    '.github/chatmodes/plan.chatmode.md',
    '.junie/Guidelines.md',
    'packages/app/.junie/guidelines.md',
    'review.PROMPT.md',
    'QWEN.md',
    'CRUSH.md',
    'WARP.md',
    '.goosehints',
    '.openhands/microagents/repo.md',
    '.openhands/microagents/sub/x.md',
    '.claude/skills/review/helper.txt',
  ])('lints %s with the strict policy', (filename) => {
    expect(
      ruleIdsFor(filename, attack, [unicodeGuard.configs['ai-instructions']]),
    ).toContain(BIDI_RULE_ID);
  });

  it.each(['README.md', 'docs/guide.md', '.junie/notes.md', 'skills.md'])(
    'does not apply to %s',
    (filename) => {
      expect(
        ruleIdsFor(filename, attack, [unicodeGuard.configs['ai-instructions']]),
      ).not.toContain(BIDI_RULE_ID);
    },
  );

  it('ignores inline disable comments in instruction files', () => {
    const disabled = `<!-- eslint-disable -->\n\n${attack}`;
    const configurations = [
      unicodeGuard.configs['ai-instructions'],
      markdownConfiguration,
    ];

    expect(ruleIdsFor('CLAUDE.md', disabled, configurations)).toContain(
      BIDI_RULE_ID,
    );
    expect(ruleIdsFor('README.md', disabled, configurations)).not.toContain(
      BIDI_RULE_ID,
    );
  });
});
