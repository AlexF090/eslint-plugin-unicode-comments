'use strict';
/* eslint-disable unicode-comments/dangerous-unicode-literals */
/* eslint-disable unicode-comments/dangerous-unicode */
Object.defineProperty(exports, '__esModule', { value: true });
exports.unicodeToAsciiMap = void 0;
// Mapping of dangerous Unicode characters to safe ASCII equivalents
exports.unicodeToAsciiMap = {
  '\u2013': '-', // en dash (–)
  '\u2014': '--', // em dash (—)
  '\u2010': '-', // hyphen (-)
  '\u2011': '-', // non-breaking hyphen (-)
  '\u2012': '-', // figure dash (-)
  '\u2015': '--', // horizontal bar (―)
  '\u2212': '-', // minus sign (−)
  '\uFE58': '-', // small em dash (﹘)
  '\uFE63': '-', // small hyphen-minus (﹣)
  '\uFF0D': '-', // fullwidth hyphen-minus (－)
  '\u2018': "'", // left single quotation mark (')
  '\u2019': "'", // right single quotation mark (')
  '\u201C': '"', // left double quotation mark (")
  '\u201D': '"', // right double quotation mark (")
  '\u201A': ',', // single low-9 quotation mark (‚)
  '\u201E': ',,', // double low-9 quotation mark („)
  '\u2039': '<', // single left-pointing angle quotation mark (‹)
  '\u203A': '>', // single right-pointing angle quotation mark (›)
};
