import * as responseTime from 'response-time';
import EventEmitter from 'events';
import { REQUEST_TIME } from '../events';

// eslint-disable-next-line @typescript-eslint/naming-convention
const _responseTime = responseTime.default;

export function responseTimeMetrics(eventBus: EventEmitter): any {
    return _responseTime((req, res, time) => {
        const { statusCode } = res;

        const pathname = req.route ? req.baseUrl + req.route.path : '(hidden)';

        const timingInfo = {
            path: pathname,
            method: req.method,
            statusCode,
            time,
        };
        eventBus.emit(REQUEST_TIME, timingInfo);
    });
}
