// Copy of https://github.com/Unleash/unleash-proxy/blob/main/src/create-context.ts.
import crypto from 'node:crypto';
import type { Context } from 'unleash-client';

export function createContext(contextData: any): Context {
    const {
        appName,
        environment,
        userId,
        sessionId,
        remoteAddress,
        properties,
        ...rest
    } = contextData;

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

export const enrichContextWithIp = (contextData: any, ip: string): Context => {
    contextData.remoteAddress = contextData.remoteAddress || ip;
    contextData.sessionId =
        contextData.sessionId || crypto.randomBytes(18).toString('hex');
    return createContext(contextData);
};
