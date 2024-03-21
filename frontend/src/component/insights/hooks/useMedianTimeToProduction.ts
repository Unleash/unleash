import { useMemo } from 'react';
import type {
    InstanceInsightsSchema,
    InstanceInsightsSchemaProjectFlagTrendsItem,
} from 'openapi';
import type { GroupedDataByProject } from './useGroupedProjectTrends';

const validTrend = (trend: InstanceInsightsSchemaProjectFlagTrendsItem) =>
    Boolean(trend) && Boolean(trend.timeToProduction);

export const useMedianTimeToProduction = (
    projectsData: GroupedDataByProject<
        InstanceInsightsSchema['projectFlagTrends']
    >,
) =>
    useMemo(() => {
        const timesToProduction: number[] = [];

        Object.values(projectsData).forEach((trends) => {
            trends.forEach((trend) => {
                if (validTrend(trend)) {
                    timesToProduction.push(trend.timeToProduction!);
                }
            });
        });

        if (timesToProduction.length === 0) {
            return 0;
        }

        timesToProduction.sort((a, b) => a - b);

        const midIndex = Math.floor(timesToProduction.length / 2);

        const median =
            timesToProduction.length % 2 === 0
                ? (timesToProduction[midIndex - 1] +
                      timesToProduction[midIndex]) /
                  2
                : timesToProduction[midIndex];

        return median;
    }, [projectsData]);
