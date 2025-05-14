import { useMemo } from 'react';
import { useTheme } from '@mui/material';
import type {
    InstanceInsightsSchema,
    InstanceInsightsSchemaMetricsSummaryTrendsItem,
} from 'openapi';
import { useProjectColor } from './useProjectColor.js';
import type { GroupedDataByProject } from './useGroupedProjectTrends.js';
import { format } from 'date-fns';

type MetricsSummaryTrends = InstanceInsightsSchema['metricsSummaryTrends'];

const weekIdFromDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy-ww');
};

export const useFilledMetricsSummary = (
    filteredMetricsSummaryTrends: GroupedDataByProject<MetricsSummaryTrends>,
    allDataPointsSorted: string[],
) => {
    const theme = useTheme();
    const getProjectColor = useProjectColor();

    const data = useMemo(() => {
        const datasets = Object.entries(filteredMetricsSummaryTrends).map(
            ([project, trends]) => {
                const trendsMap = new Map<
                    string,
                    InstanceInsightsSchemaMetricsSummaryTrendsItem
                >(trends.map((trend) => [trend.date, trend]));

                const normalizedData = allDataPointsSorted.map((date) => {
                    return (
                        trendsMap.get(date) || {
                            date,
                            totalRequests: 0,
                            totalNo: 0,
                            project,
                            totalApps: 0,
                            totalYes: 0,
                            totalEnvironments: 0,
                            totalFlags: 0,
                            week: weekIdFromDate(date),
                        }
                    );
                });

                const color = getProjectColor(project);
                return {
                    label: project,
                    data: normalizedData,
                    borderColor: color,
                    backgroundColor: color,
                    fill: false,
                };
            },
        );

        return { datasets };
    }, [theme, filteredMetricsSummaryTrends, getProjectColor]);

    return data;
};
