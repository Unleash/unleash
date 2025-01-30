import { format } from 'date-fns';
import type { TrafficUsageDataSegmentedCombinedSchema } from 'openapi';

export const monthlyTrafficDataToCurrentUsage = (
    usage?: TrafficUsageDataSegmentedCombinedSchema,
) => {
    if (!usage) {
        return 0;
    }
    const currentMonth = format(new Date(), 'yyyy-MM');
    return usage.apiData.reduce((acc, current) => {
        const currentPoint = current.dataPoints.find(
            ({ period }) => period === currentMonth,
        );
        const pointUsage =
            currentPoint?.trafficTypes.reduce(
                (acc, next) => acc + next.count,
                0,
            ) ?? 0;
        return acc + pointUsage;
    }, 0);
};
