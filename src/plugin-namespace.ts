/** Prefix of every rule, language, and preset name of this plugin. */
export const PLUGIN_NAMESPACE = 'unicode-guard';

/** The name of a rule, language, or preset as configurations refer to it, such as `unicode-guard/no-bidi-control`. */
export const qualifyName = (name: string): string =>
  `${PLUGIN_NAMESPACE}/${name}`;
