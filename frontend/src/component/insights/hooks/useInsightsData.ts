import { useMemo } from 'react';
import type { InstanceInsightsSchema } from 'openapi';
import { useFilteredTrends } from './useFilteredTrends.js';
import { useGroupedProjectTrends } from './useGroupedProjectTrends.js';
import { useFilteredFlagsSummary } from './useFilteredFlagsSummary.js';
import { useAllDatapoints } from './useAllDatapoints.js';

export const useInsightsData = (
    instanceInsights: InstanceInsightsSchema,
    projects: string[],
) => {
    const allMetricsDatapoints = useAllDatapoints(
        instanceInsights.metricsSummaryTrends,
    );
    const projectsData = useFilteredTrends(
        instanceInsights.projectFlagTrends,
        projects,
    );

    const groupedProjectsData = useGroupedProjectTrends(projectsData);

    const metricsData = useFilteredTrends(
        instanceInsights.metricsSummaryTrends,
        projects,
    );
    const groupedMetricsData = useGroupedProjectTrends(metricsData);

    const summary = useFilteredFlagsSummary(projectsData);

    return useMemo(
        () => ({
            ...instanceInsights,
            projectsData,
            groupedProjectsData,
            metricsData,
            groupedMetricsData,
            environmentTypeTrends: instanceInsights.environmentTypeTrends,
            summary,
            allMetricsDatapoints,
        }),
        [
            instanceInsights,
            projects,
            projectsData,
            groupedProjectsData,
            metricsData,
            groupedMetricsData,
            summary,
        ],
    );
};
