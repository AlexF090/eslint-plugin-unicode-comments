import dangerousComments from "./rules/dangerous-comments";
import dangerousIdentifiers from "./rules/dangerous-identifiers";
import dangerousLiterals from "./rules/dangerous-literals";
import dangerousTemplateLiterals from "./rules/dangerous-template-literals";
const plugin = {
    rules: {
        "dangerous-unicode": dangerousComments,
        "dangerous-unicode-literals": dangerousLiterals,
        "dangerous-unicode-template-literals": dangerousTemplateLiterals,
        "dangerous-unicode-identifiers": dangerousIdentifiers,
    },
    configs: {
        recommended: {
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
export default plugin;
// Legacy ESLint Config support - ensure CommonJS compatibility
if (typeof module !== "undefined" && module.exports) {
    module.exports = plugin;
    module.exports.default = plugin;
}
//# sourceMappingURL=index.js.map