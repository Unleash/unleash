// Copy of https://github.com/Unleash/unleash-proxy/blob/main/src/create-context.ts.

/* eslint-disable prefer-object-spread */
import { Context } from 'unleash-client';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
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
