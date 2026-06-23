const MASKED_EMAIL = '***';

export function anonymizeContext(
    context: Record<string, unknown>,
): Record<string, unknown> {
    if (typeof context.email !== 'string') {
        return context;
    }
    return { ...context, email: MASKED_EMAIL };
}
