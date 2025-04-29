import { differenceInCalendarMonths } from 'date-fns';
import type { TrafficUsageDataSegmentedCombinedSchema } from 'openapi';
import { currentMonth } from './dates.js';

export const averageTrafficPreviousMonths = (
    traffic: TrafficUsageDataSegmentedCombinedSchema,
) => {
    if (traffic.grouping === 'daily') {
        return 0;
    }

    const monthsToCount = Math.abs(
        differenceInCalendarMonths(
            new Date(traffic.dateRange.to),
            new Date(traffic.dateRange.from),
        ),
    );

    const totalTraffic = traffic.apiData
        .map((endpoint) =>
            endpoint.dataPoints
                .filter(({ period }) => period !== currentMonth)
                .reduce(
                    (acc, current) => acc + current.trafficTypes[0].count,
                    0,
                ),
        )
        .reduce((total, next) => total + next, 0);

    return Math.round(totalTraffic / monthsToCount);
};
