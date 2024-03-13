import { useMemo } from 'react';
import { useTheme } from '@mui/material';
import {
    ExecutiveSummarySchema,
    ExecutiveSummarySchemaMetricsSummaryTrendsItem,
} from 'openapi';
import { useProjectColor } from './useProjectColor';

type MetricsSummaryTrends = ExecutiveSummarySchema['metricsSummaryTrends'];

type GroupedDataByProject = Record<
    string,
    ExecutiveSummarySchemaMetricsSummaryTrendsItem[]
>;

function groupDataByProject(
    data: ExecutiveSummarySchemaMetricsSummaryTrendsItem[],
): GroupedDataByProject {
    const groupedData: GroupedDataByProject = {};

    data.forEach((item) => {
        const { project } = item;
        if (!groupedData[project]) {
            groupedData[project] = [];
        }
        groupedData[project].push(item);
    });

    return groupedData;
}

export const useMetricsSummary = (
    metricsSummaryTrends: MetricsSummaryTrends,
) => {
    const theme = useTheme();
    const getProjectColor = useProjectColor();

    const data = useMemo(() => {
        const groupedMetrics = groupDataByProject(metricsSummaryTrends);
        const datasets = Object.entries(groupedMetrics).map(
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
