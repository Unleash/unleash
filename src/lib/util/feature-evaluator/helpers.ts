import { userInfo, hostname } from 'os';
import { Context } from './context';

export type FallbackFunction = (name: string, context: Context) => boolean;

export function createFallbackFunction(
    name: string,
    context: Context,
    fallback?: FallbackFunction | boolean,
): Function {
    if (typeof fallback === 'function') {
        return () => fallback(name, context);
    }
    if (typeof fallback === 'boolean') {
        return () => fallback;
    }
    return () => false;
}

export function resolveContextValue(
    context: Context,
    field: string,
): string | undefined {
    if (context[field]) {
        return context[field] as string;
    }
    if (context.properties && context.properties[field]) {
        return context.properties[field] as string;
    }
    return undefined;
}

export function safeName(str: string = ''): string {
    return str.replace(/\//g, '_');
}

export function generateInstanceId(instanceId?: string): string {
    if (instanceId) {
        return instanceId;
    }
    let info;
    try {
        info = userInfo();
    } catch (e) {
        // unable to read info;
    }

    const prefix = info
        ? info.username
        : `generated-${Math.round(Math.random() * 1000000)}-${process.pid}`;
    return `${prefix}-${hostname()}`;
}
