import { performance } from 'node:perf_hooks';
import { REQUEST_TIME, SDK_CONNECTION_ID_RECEIVED } from '../metric-events.js';
import type EventEmitter from 'events';
import type { RequestHandler } from 'express';
import type { IFlagResolver } from '../internals.js';
import type { InstanceStatsService } from '../server-impl.js';

const appNameReportingThreshold = 1000;

export const storeRequestedRoute: RequestHandler = (req, res, next) => {
    if (req.route) {
        res.locals = {
            ...res.locals,
            route: `${req.baseUrl}${req.route.path}`,
        };
    }
    next();
};

function collapse(path: string): string {
    let prefix = '';
    if (path) {
        if (path.startsWith('/api/admin')) {
            prefix = '/api/admin/';
        } else if (path.startsWith('/api/client')) {
            prefix = '/api/client/';
        } else if (path.startsWith('/api/frontend')) {
            prefix = '/api/frontend/';
        } else if (path.startsWith('/api')) {
            prefix = '/api/';
        } else if (path.startsWith('/edge')) {
            prefix = '/edge/';
        } else if (path.startsWith('/auth')) {
            prefix = '/auth/';
        }
    }

    return `${prefix}(hidden)`;
}

export function responseTimeMetrics(
    eventBus: EventEmitter,
    flagResolver: IFlagResolver,
    instanceStatsService: Pick<InstanceStatsService, 'getAppCountSnapshot'>,
): RequestHandler {
    return (req, res, next) => {
        const start = performance.now();

        res.once('finish', () => {
            const { method, path: reqPath, originalUrl, headers, query } = req;
            const statusCode = res.statusCode;

            // — derive pathname —
            let pathname: string | undefined;
            if (res.locals.route) {
                pathname = res.locals.route;
            } else if (req.route) {
                pathname = req.baseUrl + req.route.path;
            }
            pathname = pathname ?? collapse(reqPath);

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

                if (originalUrl.includes('/api/client') && connId) {
                    eventBus.emit(SDK_CONNECTION_ID_RECEIVED, {
                        connectionId: connId,
                        type: 'backend',
                    });
                }
                if (originalUrl.includes('/api/frontend') && connId) {
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
