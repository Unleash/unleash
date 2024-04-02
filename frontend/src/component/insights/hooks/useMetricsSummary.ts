import { useMemo } from 'react';
import { useTheme } from '@mui/material';
import type { InstanceInsightsSchema } from 'openapi';
import { useProjectColor } from './useProjectColor';
import type { GroupedDataByProject } from './useGroupedProjectTrends';

type MetricsSummaryTrends = InstanceInsightsSchema['metricsSummaryTrends'];

export const useMetricsSummary = (
    metricsSummaryTrends: GroupedDataByProject<MetricsSummaryTrends>,
) => {
    const theme = useTheme();
    const getProjectColor = useProjectColor();

    const data = useMemo(() => {
        const datasets = Object.entries(metricsSummaryTrends).map(
            ([project, trends]) => {
                const color = getProjectColor(project);
                return {
                    label: project,
                    data: trends,
                    borderColor: color,
                    backgroundColor: color,
                    fill: false,
                };
            },
        );
        return { datasets };
    }, [theme, metricsSummaryTrends]);

    return data;
};
