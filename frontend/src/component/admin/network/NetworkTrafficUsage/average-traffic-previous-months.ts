import { differenceInCalendarMonths, format } from 'date-fns';
import type { TrafficUsageDataSegmentedCombinedSchema } from 'openapi';

export const averageTrafficPreviousMonths = (
    endpointData: string[],
    traffic: TrafficUsageDataSegmentedCombinedSchema,
) => {
    if (!traffic || traffic.grouping === 'daily') {
        return 0;
    }

    const monthsToCount = Math.abs(
        differenceInCalendarMonths(
            new Date(traffic.dateRange.to),
            new Date(traffic.dateRange.from),
        ),
    );

    const currentMonth = format(new Date(), 'yyyy-MM');

    const totalTraffic = traffic.apiData
        .filter((endpoint) => endpointData.includes(endpoint.apiPath))
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
