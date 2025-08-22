declare const plugin: {
    rules: {
        "dangerous-unicode": import("eslint").Rule.RuleModule;
        "dangerous-unicode-literals": import("eslint").Rule.RuleModule;
        "dangerous-unicode-template-literals": import("eslint").Rule.RuleModule;
        "dangerous-unicode-identifiers": import("eslint").Rule.RuleModule;
    };
    configs: {
        recommended: {
            plugins: string[];
            rules: {
                "unicode-comments/dangerous-unicode": string;
                "unicode-comments/dangerous-unicode-literals": string;
                "unicode-comments/dangerous-unicode-template-literals": string;
                "unicode-comments/dangerous-unicode-identifiers": string;
            };
        };
    };
};
export default plugin;
//# sourceMappingURL=index.d.ts.map