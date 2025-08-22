import type { Rule } from "eslint";
import { unicodeToAsciiMap } from "../utils/unicode-mapping";

const dangerousPattern = new RegExp(
  [
    /[\u202A-\u202E\u2066-\u2069]/.source, // Trojan Source
    /[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D]/.source, // Unicode Hyphens
    /[\u0430-\u044F\u0451]/.source, // Cyrillic Homographs
    /[\u0391-\u03A9\u03B1-\u03C9]/.source, // Greek Homographs
    /[\uD835]/.source, // Mathematical Alphanumeric
    /[\uFF01-\uFF5E]/.source, // Fullwidth ASCII
    /[\u00AD\u061C\u180E\u200B-\u200F\u2028\u2029\u202F\u2060-\u2064\uFEFF]/
      .source, // Zero-width/Invisible
    /[\u2018-\u201F\u2039\u203A]/.source, // Unicode Quotes
  ].join("|")
);

const rule: Rule.RuleModule = {
  meta: {
    type: "suggestion" as const,
    docs: {
      description: "Disallow dangerous Unicode characters in comments",
      category: "Best Practices",
      recommended: true,
    },
    fixable: "code" as const,
    schema: [],
    messages: {
      dangerousUnicode:
        "Comment contains dangerous Unicode characters. Use ASCII only.",
    },
  },
  create(context: Rule.RuleContext): Rule.RuleListener {
    return {
      Program() {
        const sourceCode = context.sourceCode || context.getSourceCode();
        const comments = sourceCode.getAllComments();

        comments.forEach((comment) => {
          if (dangerousPattern.test(comment.value)) {
            context.report({
              loc: comment.loc!,
              message:
                "Comment contains dangerous Unicode characters. Use ASCII only.",
              fix(fixer) {
                let fixedValue = comment.value;

                // Ersetze alle gefährlichen Unicode-Zeichen
                Object.keys(unicodeToAsciiMap).forEach((unicode) => {
                  const asciiValue = unicodeToAsciiMap[unicode];
                  fixedValue = fixedValue.replace(
                    new RegExp(unicode, "g"),
                    asciiValue
                  );
                });

                // Erstelle den neuen Kommentar
                const commentType = comment.type === "Block" ? "/*" : "//";
                const commentEnd = comment.type === "Block" ? "*/" : "";
                const newComment = `${commentType}${fixedValue}${commentEnd}`;

                return fixer.replaceTextRange(comment.range!, newComment);
              },
            });
          }
        });
      },
    };
  },
};

// eslint-disable-next-line import/no-default-export
export default rule;
