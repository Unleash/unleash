import { useMemo } from 'react';
import { useTheme } from '@mui/material';
import { getProjectColor } from '../executive-dashboard-utils';
import {
    ExecutiveSummarySchema,
    ExecutiveSummarySchemaMetricsSummaryTrendsItem,
} from 'openapi';

type MetricsSummaryTrends = ExecutiveSummarySchema['metricsSummaryTrends'];

export const useMetricsSummary = (
    metricsSummaryTrends: MetricsSummaryTrends,
    field: 'total' | 'totalYes' | 'totalNo' | 'totalApps',
) => {
    const theme = useTheme();

    const data = useMemo(() => {
        const groupedFlagTrends = metricsSummaryTrends.reduce<
            Record<string, ExecutiveSummarySchemaMetricsSummaryTrendsItem[]>
        >((groups, item) => {
            if (!groups[item.project]) {
                groups[item.project] = [];
            }
            groups[item.project].push(item);
            return groups;
        }, {});

        const datasets = Object.entries(groupedFlagTrends).map(
            ([project, metricsSummaryTrends]) => {
                const color = getProjectColor(project);
                return {
                    label: project,
                    data: metricsSummaryTrends.map((item) => {
                        if (field !== 'total') {
                            return item[field] || 0;
                        }
                        return item.totalYes + item.totalNo || 0;
                    }),
                    borderColor: color,
                    backgroundColor: color,
                    fill: false,
                };
            },
        );

        const objectKeys = Object.keys(groupedFlagTrends);

        const firstElementSummary = groupedFlagTrends[objectKeys[0]] || [];
        const firstElementsDates = firstElementSummary.map((item) => item.date);

        return {
            labels: firstElementsDates,
            datasets,
        };
    }, [theme, metricsSummaryTrends]);

    return data;
};
