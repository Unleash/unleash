import type { Context } from './context.js';

export function resolveContextValue(
    context: Context,
    field: string,
): string | undefined {
    if (context[field]) {
        return context[field] as string;
    }
    if (context.properties?.[field]) {
        return context.properties[field] as string;
    }
    return undefined;
}
