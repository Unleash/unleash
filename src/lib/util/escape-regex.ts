export function safeRegExp(pattern: string, flags?: string): RegExp {
    return new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
}
