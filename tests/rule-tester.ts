import { createRequire } from 'node:module';
import { RuleTester as EslintRuleTester } from 'eslint';
import { version } from 'eslint/package.json';

const require = createRequire(import.meta.url);
const eslintMajor = Number.parseInt(version.split('.')[0], 10);

// ESLint 8's default RuleTester rejects flat-config options like
// `languageOptions`, so it needs the flat-config-aware tester from this
// subpath instead. ESLint 9 and 10 ship that tester as the default
// RuleTester, so no subpath import is needed there.
const RuleTester =
  eslintMajor < 9
    ? (
        require('eslint/use-at-your-own-risk') as {
          FlatRuleTester: typeof EslintRuleTester;
        }
      ).FlatRuleTester
    : EslintRuleTester;

export { RuleTester };
