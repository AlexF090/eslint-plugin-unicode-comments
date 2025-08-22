"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dangerous_comments_1 = __importDefault(require("./rules/dangerous-comments"));
const dangerous_identifiers_1 = __importDefault(require("./rules/dangerous-identifiers"));
const dangerous_literals_1 = __importDefault(require("./rules/dangerous-literals"));
const dangerous_template_literals_1 = __importDefault(require("./rules/dangerous-template-literals"));
const plugin = {
    rules: {
        "dangerous-unicode": dangerous_comments_1.default,
        "dangerous-unicode-literals": dangerous_literals_1.default,
        "dangerous-unicode-template-literals": dangerous_template_literals_1.default,
        "dangerous-unicode-identifiers": dangerous_identifiers_1.default,
    },
    configs: {
        recommended: {
            // Legacy config (ESLint 8 and below)
            plugins: ["unicode-comments"],
            rules: {
                "unicode-comments/dangerous-unicode": "error",
                "unicode-comments/dangerous-unicode-literals": "error",
                "unicode-comments/dangerous-unicode-template-literals": "error",
                "unicode-comments/dangerous-unicode-identifiers": "error",
            },
        },
    },
};
// ESLint Flat Config support
exports.default = plugin;
// Legacy ESLint Config support - ensure CommonJS compatibility
if (typeof module !== "undefined" && module.exports) {
    module.exports = plugin;
    module.exports.default = plugin;
}
//# sourceMappingURL=index.js.map