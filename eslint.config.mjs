import tseslint from 'typescript-eslint';
import regexpPlugin from 'eslint-plugin-regexp';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: ['dist/**', 'coverage/**'],
  },
  tseslint.configs.recommended,
  {
    plugins: { regexp: regexpPlugin },
    rules: {
      'regexp/no-dupe-characters-character-class': 'error',
    },
  },
  eslintConfigPrettier,
);
