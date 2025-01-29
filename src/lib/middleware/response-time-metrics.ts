import * as responseTime from 'response-time';
import type EventEmitter from 'events';
import { REQUEST_TIME, SDK_CONNECTION_ID_RECEIVED } from '../metric-events';
import type { IFlagResolver } from '../types/experimental';
import type { InstanceStatsService } from '../services';
import type { RequestHandler } from 'express';

const _responseTime = responseTime.default;
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
    return _responseTime((req, res, time) => {
        const { statusCode } = res;
        let pathname: string | undefined = undefined;
        if (res.locals.route) {
            pathname = res.locals.route;
        } else if (req.route) {
            pathname = req.baseUrl + req.route.path;
        }
        // when pathname is undefined use a fallback
        pathname = pathname ?? collapse(req.path);
        let appName: string | undefined;
        if (
            !flagResolver.isEnabled('responseTimeWithAppNameKillSwitch') &&
            (instanceStatsService.getAppCountSnapshot('7d') ??
                appNameReportingThreshold) < appNameReportingThreshold
        ) {
            appName =
                req.headers['x-unleash-appname'] ??
                req.headers['unleash-appname'] ??
                req.query.appName;
        }

        if (flagResolver.isEnabled('uniqueSdkTracking')) {
            // if some SDK doesn't provide any
            const connectionId =
                req.headers['x-unleash-connection-id'] ||
                `${req.headers['unleash-instanceid']}${req.ip}`;
            // todo: exclude short lived APIs like PHP and Next
            eventBus.emit(SDK_CONNECTION_ID_RECEIVED, {
                connectionId,
                type: req.url.includes('/frontend') ? 'frontend' : 'backend',
            });
        }

        const timingInfo = {
            path: pathname,
            method: req.method,
            statusCode,
            time,
            appName,
        };
        if (!res.locals.responseTimeEmitted) {
            res.locals.responseTimeEmitted = true;
            eventBus.emit(REQUEST_TIME, timingInfo);
        }
    });
}
