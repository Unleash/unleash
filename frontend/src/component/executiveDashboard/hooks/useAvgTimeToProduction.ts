import { useMemo } from 'react';
import type {
    ExecutiveSummarySchema,
    ExecutiveSummarySchemaProjectFlagTrendsItem,
} from 'openapi';
import type { GroupedDataByProject } from './useGroupedProjectTrends';

const validTrend = (trend: ExecutiveSummarySchemaProjectFlagTrendsItem) =>
    Boolean(trend) && Boolean(trend.timeToProduction);

export const useAvgTimeToProduction = (
    projectsData: GroupedDataByProject<
        ExecutiveSummarySchema['projectFlagTrends']
    >,
) =>
    useMemo(() => {
        let totalProjects = Object.keys(projectsData).length;

        if (totalProjects === 0) {
            return 0;
        }

        const totalAvgTimeToProduction = Object.entries(projectsData).reduce(
            (acc, [_, trends]) => {
                const latestTrend = trends.reduce(
                    (latest, current) =>
                        new Date(latest.date) < new Date(current.date)
                            ? current
                            : latest,
                    trends[0],
                );

                // If there's no valid latest trend, this project won't contribute to the average
                if (!validTrend(latestTrend)) {
                    totalProjects--;
                    return acc;
                }

                const timeToProduction = latestTrend.timeToProduction || 0;
                return acc + timeToProduction;
            },
            0,
        );

        const overallAverage = totalAvgTimeToProduction / totalProjects;

        return overallAverage;
    }, [projectsData]);
