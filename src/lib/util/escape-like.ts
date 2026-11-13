/**
 * Escapes the characters that have a special meaning in a SQL `LIKE` pattern
 * (`%`, `_` and the escape character `\` itself), so that the value is matched
 * literally. Relies on backslash being the escape character, which is the
 * PostgreSQL default when no `ESCAPE` clause is given.
 */
export const escapeLikePattern = (value: string): string =>
    value.replace(/[\\%_]/g, '\\$&');
