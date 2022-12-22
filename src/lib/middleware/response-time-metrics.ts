import * as responseTime from 'response-time';
import EventEmitter from 'events';
import { REQUEST_TIME } from '../metric-events';
import { IFlagResolver } from '../types/experimental';
import { InstanceStatsService } from 'lib/services';
import memoizee from 'memoizee';

// eslint-disable-next-line @typescript-eslint/naming-convention
const _responseTime = responseTime.default;

const countAppNames = async (
    instanceStatsService: Pick<InstanceStatsService, 'getLabeledAppCounts'>,
) => {
    const response = await instanceStatsService.getLabeledAppCounts();
    return response.find((c) => c.range === '7d').count;
};
export function responseTimeMetrics(
    eventBus: EventEmitter,
    flagResolver: IFlagResolver,
    instanceStatsService: Pick<InstanceStatsService, 'getLabeledAppCounts'>,
): any {
    const appNameReportingThreshold = 100;
    let appNameCount = memoizee(() => countAppNames(instanceStatsService), {
        promise: true,
        maxAge: 30000, // milliseconds
    });
    return _responseTime(async (req, res, time) => {
        const { statusCode } = res;
        const pathname = req.route ? req.baseUrl + req.route.path : '(hidden)';

        let appName;
        if (
            flagResolver.isEnabled('responseTimeWithAppName') &&
            (await appNameCount()) < appNameReportingThreshold
        ) {
            appName = req.headers['unleash-appname'] ?? req.query.appName;
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
