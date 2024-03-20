import { useMemo } from 'react';
import type { ExecutiveSummarySchema } from 'openapi';
import type { GroupedDataByProject } from './useGroupedProjectTrends';

export const useAvgTimeToProduction = (
    projectsData: GroupedDataByProject<
        ExecutiveSummarySchema['projectFlagTrends']
    >,
) =>
    useMemo(() => {
        const totalProjects = Object.keys(projectsData).length;

        if (totalProjects === 0) {
            return 0;
        }

        const totalAvgTimeToProduction = Object.entries(projectsData).reduce(
            (acc, [_, trends]) => {
                // Assuming trends are not sorted and there's a `date` property to determine the latest
                const latestTrend = trends
                    .filter(
                        (trend) =>
                            trend.timeToProduction !== undefined &&
                            trend.date !== undefined,
                    )
                    .reduce(
                        (latest, current) =>
                            new Date(latest.date) < new Date(current.date)
                                ? current
                                : latest,
                        trends[0],
                    );

                // If there's no valid latest trend, this project won't contribute to the average
                if (!latestTrend) {
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
