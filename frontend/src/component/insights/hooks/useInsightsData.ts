import { useMemo } from 'react';
import type { InstanceInsightsSchema } from 'openapi';
import { useFilteredTrends } from './useFilteredTrends';
import { useGroupedProjectTrends } from './useGroupedProjectTrends';
import { useFilteredFlagsSummary } from './useFilteredFlagsSummary';
import { useMedianTimeToProduction } from './useMedianTimeToProduction';

export const useInsightsData = (
    executiveDashboardData: InstanceInsightsSchema,
    projects: string[],
) => {
    const projectsData = useFilteredTrends(
        executiveDashboardData.projectFlagTrends,
        projects,
    );

    const groupedProjectsData = useGroupedProjectTrends(projectsData);

    const metricsData = useFilteredTrends(
        executiveDashboardData.metricsSummaryTrends,
        projects,
    );
    const groupedMetricsData = useGroupedProjectTrends(metricsData);

    const summary = useFilteredFlagsSummary(
        projectsData,
        executiveDashboardData.users,
    );

    const medianTimeToProduction =
        useMedianTimeToProduction(groupedProjectsData);

    return useMemo(
        () => ({
            ...executiveDashboardData,
            projectsData,
            groupedProjectsData,
            metricsData,
            groupedMetricsData,
            users: executiveDashboardData.users,
            environmentTypeTrends: executiveDashboardData.environmentTypeTrends,
            summary,
            medianTimeToProduction,
        }),
        [
            executiveDashboardData,
            projects,
            projectsData,
            groupedProjectsData,
            metricsData,
            groupedMetricsData,
            summary,
            medianTimeToProduction,
        ],
    );
};
