import type { ExecutiveSummarySchema } from 'openapi';
import { useMemo } from 'react';
import { GroupedDataByProject } from './useGroupedProjectTrends';

export const useAvgTimeToProduction = (
    projectsData: GroupedDataByProject<
        ExecutiveSummarySchema['projectFlagTrends']
    >,
) =>
    useMemo(() => {
        const totalProjects = Object.keys(projectsData).length;

        const totalTimeToProduction = Object.entries(projectsData).reduce(
            (acc, [project, trends]) => {
                const trendsCount = trends.length;
                const projectTimeToProd = trends.reduce((sum, item) => {
                    if (item.timeToProduction !== undefined) {
                        return sum + item.timeToProduction;
                    }
                    return sum;
                }, 0);

                const avgProjectTimeToProd =
                    trendsCount > 0 ? projectTimeToProd / trendsCount : 0;
                return acc + avgProjectTimeToProd;
            },
            0,
        );

        const average =
            totalProjects > 0 ? totalTimeToProduction / totalProjects : 0;

        return average;
    }, [projectsData]);
