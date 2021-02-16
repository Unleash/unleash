import  * as responseTime from 'response-time';
import { REQUEST_TIME } from '../events';

var _responseTime = responseTime.default

export function responseTimeMetrics(config) {
    return _responseTime((req, res, time) => {
        const { statusCode } = res;

        const pathname = req.route ? req.baseUrl + req.route.path : '(hidden)';

        const timingInfo = {
            path: pathname,
            method: req.method,
            statusCode,
            time,
        };
        config.eventBus.emit(REQUEST_TIME, timingInfo);
    });
};
