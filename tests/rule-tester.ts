import { createRequire } from 'node:module';
import { RuleTester as EslintRuleTester } from 'eslint';
import { version } from 'eslint/package.json';

const require = createRequire(import.meta.url);
const eslintMajor = Number.parseInt(version.split('.')[0], 10);

// ESLint 8's default RuleTester rejects flat-config options like
// `languageOptions`; the flat-config-aware tester lives under this
// subpath until it becomes the default in ESLint 9+.
const RuleTester =
  eslintMajor < 9
    ? (
        require('eslint/use-at-your-own-risk') as {
          FlatRuleTester: typeof EslintRuleTester;
        }
      ).FlatRuleTester
    : EslintRuleTester;

export { RuleTester };
