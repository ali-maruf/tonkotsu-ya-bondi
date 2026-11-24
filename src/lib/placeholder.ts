/** A value still awaiting owner confirmation looks like {{TOKEN}}. */
export const isPlaceholder = (v: unknown): boolean => v == null || (typeof v === 'string' && /\{\{.+\}\}/.test(v));
