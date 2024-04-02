// Copy of https://github.com/Unleash/unleash-proxy/blob/main/src/create-context.ts.
import crypto from 'crypto';
import type { Context } from 'unleash-client';

export function createContext(value: any): Context {
    const {
        appName,
        environment,
        userId,
        sessionId,
        remoteAddress,
        properties,
        ...rest
    } = value;

    // move non root context fields to properties
    const context: Context = {
        appName,
        environment,
        userId,
        sessionId,
        remoteAddress,
        properties: Object.assign({}, rest, properties),
    };

    // Clean undefined properties on the context
    const cleanContext = Object.keys(context)
        .filter((k) => context[k])
        .reduce((a, k) => ({ ...a, [k]: context[k] }), {});

    return cleanContext;
}

export const enrichContextWithIp = (query: any, ip: string): Context => {
    query.remoteAddress = query.remoteAddress || ip;
    query.sessionId = query.sessionId || crypto.randomBytes(18).toString('hex');
    return createContext(query);
};
