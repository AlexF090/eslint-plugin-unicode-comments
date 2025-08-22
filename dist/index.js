import dangerousComments from './rules/dangerous-comments';
import dangerousIdentifiers from './rules/dangerous-identifiers';
import dangerousLiterals from './rules/dangerous-literals';
import dangerousTemplateLiterals from './rules/dangerous-template-literals';
const plugin = {
    rules: {
        'dangerous-unicode': dangerousComments,
        'dangerous-unicode-literals': dangerousLiterals,
        'dangerous-unicode-template-literals': dangerousTemplateLiterals,
        'dangerous-unicode-identifiers': dangerousIdentifiers,
    },
};
// eslint-disable-next-line import/no-default-export
export default plugin;
// For CommonJS compatibility
module.exports = plugin;
module.exports.default = plugin;
//# sourceMappingURL=index.js.map