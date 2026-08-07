import dangerousComments from './rules/dangerous-comments';
import dangerousCommentsStyle from './rules/dangerous-comments-style';
import dangerousIdentifiers from './rules/dangerous-identifiers';
import dangerousLiterals from './rules/dangerous-literals';
import dangerousLiteralsStyle from './rules/dangerous-literals-style';
import dangerousTemplateLiterals from './rules/dangerous-template-literals';
import dangerousTemplateLiteralsStyle from './rules/dangerous-template-literals-style';

const plugin: {
  rules: Record<string, unknown>;
  configs: Record<string, unknown>;
} = {
  rules: {
    // Security rules (Trojan Source, homographs, obfuscation) - also registered under
    // their original names for backwards compatibility with existing configs.
    'dangerous-unicode': dangerousComments,
    'dangerous-unicode-security': dangerousComments,
    'dangerous-unicode-literals': dangerousLiterals,
    'dangerous-unicode-literals-security': dangerousLiterals,
    'dangerous-unicode-template-literals': dangerousTemplateLiterals,
    'dangerous-unicode-template-literals-security': dangerousTemplateLiterals,
    'dangerous-unicode-identifiers': dangerousIdentifiers,

    // Style rules: typographic tells of unedited AI-generated text (dashes, quotes,
    // ellipsis, non-breaking/thin/figure space, bullet). Not a security concern.
    'dangerous-unicode-style': dangerousCommentsStyle,
    'dangerous-unicode-literals-style': dangerousLiteralsStyle,
    'dangerous-unicode-template-literals-style': dangerousTemplateLiteralsStyle,
  },
  configs: {},
};

const recommendedRules = {
  'unicode-comments/dangerous-unicode': 'error',
  'unicode-comments/dangerous-unicode-literals': 'error',
  'unicode-comments/dangerous-unicode-template-literals': 'error',
  'unicode-comments/dangerous-unicode-identifiers': 'error',
  'unicode-comments/dangerous-unicode-style': 'warn',
  'unicode-comments/dangerous-unicode-literals-style': 'warn',
  'unicode-comments/dangerous-unicode-template-literals-style': 'warn',
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
