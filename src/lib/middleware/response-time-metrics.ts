import { performance } from 'node:perf_hooks';
import { REQUEST_TIME, SDK_CONNECTION_ID_RECEIVED } from '../metric-events.js';
import type EventEmitter from 'events';
import type { Request, RequestHandler, Response } from 'express';
import type { IFlagResolver } from '../internals.js';
import type { InstanceStatsService } from '../server-impl.js';

const appNameReportingThreshold = 1000;

const collapsePrefixes = [
    '/api/client/metrics/custom',
    '/api/client/metrics/bulk',
    '/api/client/metrics',
    '/api/client',
    '/api/admin',
    '/api/frontend',
    '/api',
    '/edge',
    '/auth',
].sort((a, b) => b.length - a.length); // longest-first specificity

const normalizePath = (
    req: Pick<Request, 'baseUrl' | 'route' | 'originalUrl' | 'path'>,
    res: Pick<Response, 'locals'>,
): string => {
    if (res.locals?.route) {
        return res.locals.route;
    }

    if (req.route?.path) {
        return `${req.baseUrl ?? ''}${req.route.path}`;
    }

    if (req.originalUrl) {
        return req.originalUrl.split('?')[0];
    }

    return req.path;
};

export const storeRequestedRoute: RequestHandler = (req, res, next) => {
    if (req.route) {
        res.locals = {
            ...res.locals,
            route: `${req.baseUrl}${req.route.path}`,
        };
    }
    next();
};

function collapse(path?: string): string {
    if (!path) {
        return '(hidden)';
    }

    for (const base of collapsePrefixes) {
        const baseWithSlash = `${base}/`;
        if (path === base || path === baseWithSlash) {
            return base;
        }
        if (path.startsWith(baseWithSlash)) {
            // Special-case: for '/api/admin' keep one segment and hide the rest.
            if (base === '/api/admin') {
                const remaining = path.slice(baseWithSlash.length); // e.g., 'features/x/y' or 'features'
                const segments = remaining.split('/').filter(Boolean);
                if (segments.length === 0) {
                    return base;
                }
                if (segments.length === 1) {
                    return `${base}/${segments[0]}`;
                }
                return `${base}/${segments[0]}/(hidden)`;
            }
            return `${base}/(hidden)`;
        }
    }

    return '(hidden)';
}

export function responseTimeMetrics(
    eventBus: EventEmitter,
    flagResolver: IFlagResolver,
    instanceStatsService: Pick<InstanceStatsService, 'getAppCountSnapshot'>,
): RequestHandler {
    return (req, res, next) => {
        const start = performance.now();

        res.once('finish', () => {
            const { method, headers, query } = req;
            const statusCode = res.statusCode;

            const resolvedPath = normalizePath(req, res);
            const pathname = collapse(resolvedPath);

            // — derive appName (feature‐flagged) —
            let appName: string | undefined;
            if (
                !flagResolver.isEnabled('responseTimeWithAppNameKillSwitch') &&
                (instanceStatsService.getAppCountSnapshot('7d') ??
                    appNameReportingThreshold) < appNameReportingThreshold
            ) {
                // @ts-expect-error one of the types of headers is not string nor undefined
                appName =
                    headers['x-unleash-appname'] ??
                    headers['unleash-appname'] ??
                    query.appName;
            }

            // — optional SDK connection tracking —
            if (flagResolver.isEnabled('uniqueSdkTracking')) {
                const connId =
                    headers['unleash-connection-id'] ||
                    headers['x-unleash-connection-id'] ||
                    headers['unleash-instanceid'];

                if (resolvedPath.includes('/api/client') && connId) {
                    eventBus.emit(SDK_CONNECTION_ID_RECEIVED, {
                        connectionId: connId,
                        type: 'backend',
                    });
                }
                if (resolvedPath.includes('/api/frontend') && connId) {
                    eventBus.emit(SDK_CONNECTION_ID_RECEIVED, {
                        connectionId: connId,
                        type: 'frontend',
                    });
                }
            }

            // include in the calculation the time of all the methods above
            const delta = performance.now() - start;
            eventBus.emit(REQUEST_TIME, {
                path: pathname,
                method,
                statusCode,
                time: +delta.toFixed(6),
                appName,
            });
        });

        next();
    };
}
