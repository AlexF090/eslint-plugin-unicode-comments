import type { Rule } from 'eslint';
import { unicodeToAsciiMap } from '../utils/unicode-mapping';

const dangerousPattern = new RegExp(
  [
    /[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D]/.source, // Unicode Hyphens
    /[\u2018-\u201F\u2039\u203A]/.source, // Unicode Quotes
    /[\u00A0\u2026\u2007\u2009\u2022]/.source, // Typographic artifacts (NBSP, ellipsis, thin/figure space, bullet)
  ].join('|'),
);

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion' as const,
    docs: {
      description:
        'Disallow typographic Unicode artifacts in comments that are common tells of unedited AI-generated text',
      recommended: true,
    },
    fixable: 'code' as const,
    schema: [],
    messages: {
      dangerousUnicodeStyle:
        'Comment contains typographic Unicode artifacts commonly produced by AI text generation. Use plain ASCII.',
    },
  },
  create(context: Rule.RuleContext): Rule.RuleListener {
    return {
      Program() {
        const sourceCode = context.sourceCode;
        const comments = sourceCode.getAllComments();

        comments.forEach((comment) => {
          if (dangerousPattern.test(comment.value)) {
            let fixedValue = comment.value;

            Object.keys(unicodeToAsciiMap).forEach((unicode) => {
              const asciiValue = unicodeToAsciiMap[unicode];
              fixedValue = fixedValue.replace(
                new RegExp(unicode, 'g'),
                asciiValue,
              );
            });

            const hasFix = fixedValue !== comment.value;

            context.report({
              loc: comment.loc!,
              message:
                'Comment contains typographic Unicode artifacts commonly produced by AI text generation. Use plain ASCII.',
              fix: hasFix
                ? (fixer) => {
                    const commentType = comment.type === 'Block' ? '/*' : '//';
                    const commentEnd = comment.type === 'Block' ? '*/' : '';
                    const newComment = `${commentType}${fixedValue}${commentEnd}`;

                    return fixer.replaceTextRange(comment.range!, newComment);
                  }
                : null,
            });
          }
        });
      },
    };
  },
};

export default rule;
