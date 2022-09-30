import * as responseTime from 'response-time';
import EventEmitter from 'events';
import { REQUEST_TIME } from '../metric-events';
import { IFlagResolver } from '../types/experimental';

// eslint-disable-next-line @typescript-eslint/naming-convention
const _responseTime = responseTime.default;

export function responseTimeMetrics(
    eventBus: EventEmitter,
    flagResolver: IFlagResolver,
): any {
    return _responseTime((req, res, time) => {
        const { statusCode } = res;

        const pathname = req.route ? req.baseUrl + req.route.path : '(hidden)';

        let appName;
        if (flagResolver.isEnabled('responseTimeWithAppName')) {
            appName = req.headers['unleash-appname'];
        }

        const timingInfo = {
            path: pathname,
            method: req.method,
            statusCode,
            time,
            appName,
        };
        eventBus.emit(REQUEST_TIME, timingInfo);
    });
}
