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
                const validTrends = trends.filter(
                    (trend) => trend.timeToProduction !== undefined,
                );
                const avgTimeToProduction =
                    validTrends.reduce(
                        (sum, item) => sum + (item.timeToProduction || 0),
                        0,
                    ) / (validTrends.length || 1);

                return acc + (validTrends.length > 0 ? avgTimeToProduction : 0);
            },
            0,
        );

        const overallAverage = totalAvgTimeToProduction / totalProjects;

        return overallAverage;
    }, [projectsData]);
