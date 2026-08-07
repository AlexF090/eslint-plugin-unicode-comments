import dangerousComments from './rules/dangerous-comments';
import dangerousIdentifiers from './rules/dangerous-identifiers';
import dangerousLiterals from './rules/dangerous-literals';
import dangerousTemplateLiterals from './rules/dangerous-template-literals';

const plugin: {
  rules: Record<string, unknown>;
  configs: Record<string, unknown>;
} = {
  rules: {
    'dangerous-unicode': dangerousComments,
    'dangerous-unicode-literals': dangerousLiterals,
    'dangerous-unicode-template-literals': dangerousTemplateLiterals,
    'dangerous-unicode-identifiers': dangerousIdentifiers,
  },
  configs: {},
};

const recommendedRules = {
  'unicode-comments/dangerous-unicode': 'error',
  'unicode-comments/dangerous-unicode-literals': 'error',
  'unicode-comments/dangerous-unicode-template-literals': 'error',
  'unicode-comments/dangerous-unicode-identifiers': 'error',
};

plugin.configs = {
  recommended: {
    // Legacy config (ESLint 8 and below)
    plugins: ['unicode-comments'],
    rules: recommendedRules,
  },
  'flat/recommended': {
    // Flat config (ESLint 9+)
    plugins: { 'unicode-comments': plugin },
    rules: recommendedRules,
  },
};

// ESLint Flat Config support
export default plugin;

// Legacy ESLint Config support - ensure CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = plugin;
  module.exports.default = plugin;
}
