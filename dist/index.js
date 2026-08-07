"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dangerous_comments_1 = __importDefault(require("./rules/dangerous-comments"));
const dangerous_comments_style_1 = __importDefault(require("./rules/dangerous-comments-style"));
const dangerous_identifiers_1 = __importDefault(require("./rules/dangerous-identifiers"));
const dangerous_literals_1 = __importDefault(require("./rules/dangerous-literals"));
const dangerous_literals_style_1 = __importDefault(require("./rules/dangerous-literals-style"));
const dangerous_template_literals_1 = __importDefault(require("./rules/dangerous-template-literals"));
const dangerous_template_literals_style_1 = __importDefault(require("./rules/dangerous-template-literals-style"));
const plugin = {
    rules: {
        // Security rules (Trojan Source, homographs, obfuscation) - also registered under
        // their original names for backwards compatibility with existing configs.
        'dangerous-unicode': dangerous_comments_1.default,
        'dangerous-unicode-security': dangerous_comments_1.default,
        'dangerous-unicode-literals': dangerous_literals_1.default,
        'dangerous-unicode-literals-security': dangerous_literals_1.default,
        'dangerous-unicode-template-literals': dangerous_template_literals_1.default,
        'dangerous-unicode-template-literals-security': dangerous_template_literals_1.default,
        'dangerous-unicode-identifiers': dangerous_identifiers_1.default,
        // Style rules: typographic tells of unedited AI-generated text (dashes, quotes,
        // ellipsis, non-breaking/thin/figure space, bullet). Not a security concern.
        'dangerous-unicode-style': dangerous_comments_style_1.default,
        'dangerous-unicode-literals-style': dangerous_literals_style_1.default,
        'dangerous-unicode-template-literals-style': dangerous_template_literals_style_1.default,
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
exports.default = plugin;
// Legacy ESLint Config support - ensure CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = plugin;
    module.exports.default = plugin;
}
//# sourceMappingURL=index.js.map