'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const dangerous_comments_1 = require('./rules/dangerous-comments');
const dangerous_identifiers_1 = require('./rules/dangerous-identifiers');
const dangerous_literals_1 = require('./rules/dangerous-literals');
const dangerous_template_literals_1 = require('./rules/dangerous-template-literals');

const plugin = {
  rules: {
    'dangerous-unicode': dangerous_comments_1.default,
    'dangerous-unicode-literals': dangerous_literals_1.default,
    'dangerous-unicode-template-literals':
      dangerous_template_literals_1.default,
    'dangerous-unicode-identifiers': dangerous_identifiers_1.default,
  },
};

module.exports = plugin;
