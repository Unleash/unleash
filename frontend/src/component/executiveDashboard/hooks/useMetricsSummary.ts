import { useMemo } from 'react';
import { useTheme } from '@mui/material';
import type { ExecutiveSummarySchema } from 'openapi';
import { useProjectColor } from './useProjectColor';
import type { GroupedDataByProject } from './useGroupedProjectTrends';

type MetricsSummaryTrends = ExecutiveSummarySchema['metricsSummaryTrends'];

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
