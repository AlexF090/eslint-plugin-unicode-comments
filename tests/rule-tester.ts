import { RuleTester as EslintRuleTester, Linter } from 'eslint';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const eslintMajor = Number.parseInt(Linter.version, 10);

// ESLint 8's default RuleTester rejects flat-config options like
// `languageOptions`, so it needs the flat-config-aware tester from this
// subpath instead. ESLint 9 and 10 ship that tester as the default
// RuleTester, so no subpath import is needed there.
// `use-at-your-own-risk` is ESLint's own name for this subpath — it's
// explicitly unsupported/internal API, so a future ESLint 8.x patch could
// rename or remove `FlatRuleTester` without a semver-major bump.
const RuleTester =
  eslintMajor < 9
    ? (
        require('eslint/use-at-your-own-risk') as {
          FlatRuleTester: typeof EslintRuleTester;
        }
      ).FlatRuleTester
    : EslintRuleTester;

export { RuleTester };
