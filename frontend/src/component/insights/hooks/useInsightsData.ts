import { useMemo } from 'react';
import type { InstanceInsightsSchema } from 'openapi';
import { useFilteredTrends } from './useFilteredTrends';
import { useGroupedProjectTrends } from './useGroupedProjectTrends';
import { useFilteredFlagsSummary } from './useFilteredFlagsSummary';

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
        }),
        [
            executiveDashboardData,
            projects,
            projectsData,
            groupedProjectsData,
            metricsData,
            groupedMetricsData,
            summary,
        ],
    );
};
