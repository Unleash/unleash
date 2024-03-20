import { useMemo } from 'react';
import type { ExecutiveSummarySchema } from 'openapi';
import { useFilteredTrends } from './useFilteredTrends';
import { useGroupedProjectTrends } from './useGroupedProjectTrends';
import { useFilteredFlagsSummary } from './useFilteredFlagsSummary';
import { useAvgTimeToProduction } from './useAvgTimeToProduction';

export const useDashboardData = (
    executiveDashboardData: ExecutiveSummarySchema,
    projects: string[],
) =>
    useMemo(() => {
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

        const { users, environmentTypeTrends } = executiveDashboardData;

        const summary = useFilteredFlagsSummary(projectsData);

        const avgDaysToProduction = useAvgTimeToProduction(groupedProjectsData);

        return {
            ...executiveDashboardData,
            projectsData,
            groupedProjectsData,
            metricsData,
            groupedMetricsData,
            users,
            environmentTypeTrends,
            summary,
            avgDaysToProduction,
        };
    }, [executiveDashboardData, projects]);
