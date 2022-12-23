import * as responseTime from 'response-time';
import EventEmitter from 'events';
import { REQUEST_TIME } from '../metric-events';
import { IFlagResolver } from '../types/experimental';
import { InstanceStatsService } from 'lib/services';

// eslint-disable-next-line @typescript-eslint/naming-convention
const _responseTime = responseTime.default;

const appNameReportingThreshold = 100;

export function responseTimeMetrics(
    eventBus: EventEmitter,
    flagResolver: IFlagResolver,
    instanceStatsService: Pick<InstanceStatsService, 'getStatsSnapshot'>,
): any {
    let appCount = appNameReportingThreshold;

    return _responseTime(async (req, res, time) => {
        const { statusCode } = res;
        const pathname = req.route ? req.baseUrl + req.route.path : '(hidden)';

        // async get of appCount (only if promise is settled)
        instanceStatsService
            .getStatsSnapshot()
            .then((stats) => {
                const currentCount = stats?.clientApps?.find(
                    (t) => t.range === '7d',
                )?.count;
                // update app count
                appCount =
                    currentCount === undefined
                        ? appNameReportingThreshold
                        : currentCount;
            })
            .catch(() => {});

        let appName;
        if (
            flagResolver.isEnabled('responseTimeWithAppName') &&
            appCount < appNameReportingThreshold
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
