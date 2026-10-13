import { sourceContexts, type SourceContext } from '../core/source-context.ts';
import { allowEntrySchema, characterOf } from './allow-option.ts';
import { createFindingRule } from './create-finding-rule.ts';

export type ContextPolicy = Partial<Record<SourceContext, string[]>>;

export type AllowedCharactersOptions = [ContextPolicy];

/** Any visible character: letters, marks, numbers, punctuation, and symbols (including emoji). */
export const visibleCharacters = [
  '\\p{L}',
  '\\p{M}',
  '\\p{N}',
  '\\p{P}',
  '\\p{S}',
];

export const recommendedContextPolicy: Required<ContextPolicy> = {
  code: [],
  identifier: [],
  comment: visibleCharacters,
  string: visibleCharacters,
  text: visibleCharacters,
};

export const strictContextPolicy: Required<ContextPolicy> = {
  code: [],
  identifier: [],
  comment: [],
  string: [],
  text: [],
};

export const allowedCharacters = createFindingRule<AllowedCharactersOptions>({
  name: 'allowed-characters',
  type: 'problem',
  description:
    'Allow only listed non-ASCII characters per source context (code, identifiers, comments, strings, prose); ASCII is always allowed',
  messages: {
    notAllowed:
      'Character {{character}} is not allowed in {{context}}. Use ASCII, or add it to the allowed-characters option for this context.',
  },
  schema: [
    {
      type: 'object',
      properties: Object.fromEntries(
        sourceContexts.map((context) => [context, allowEntrySchema]),
      ),
      additionalProperties: false,
    },
  ],
  defaultOptions: [recommendedContextPolicy],
  createSelector: ([policy], compileAllowList) => {
    const isAllowedIn = Object.fromEntries(
      sourceContexts.map((context) => [
        context,
        compileAllowList(policy[context] ?? []),
      ]),
    );
    return (finding) =>
      finding.category === 'other' &&
      isAllowedIn[finding.context]?.(characterOf(finding)) !== true;
  },
  messageId: () => 'notAllowed',
});
