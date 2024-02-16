import { useMemo } from 'react';
import {
    ExecutiveSummarySchema,
    ExecutiveSummarySchemaProjectFlagTrendsItem,
} from '../../openapi';
import { getRandomColor } from './executive-dashboard-utils';
import { useTheme } from '@mui/material';

type ProjectFlagTrends = ExecutiveSummarySchema['projectFlagTrends'];

export const useProjectChartData = (
    projectFlagTrends: ProjectFlagTrends,
    field: 'timeToProduction' | 'total' | 'health',
) => {
    const theme = useTheme();

    const data = useMemo(() => {
        const groupedFlagTrends = projectFlagTrends.reduce<
            Record<string, ExecutiveSummarySchemaProjectFlagTrendsItem[]>
        >((groups, item) => {
            if (!groups[item.project]) {
                groups[item.project] = [];
            }
            groups[item.project].push(item);
            return groups;
        }, {});

        const datasets = Object.entries(groupedFlagTrends).map(
            ([project, trends]) => {
                const color = getRandomColor();
                return {
                    label: project,
                    data: trends.map((item) => {
                        return item[field] || 0;
                    }),
                    borderColor: color,
                    backgroundColor: color,
                    fill: false,
                };
            },
        );

        const objectKeys = Object.keys(groupedFlagTrends);

        const firstElementTrends = groupedFlagTrends[objectKeys[0]] || [];
        const firstElementsDates = firstElementTrends.map((item) => item.date);

        return {
            labels: firstElementsDates,
            datasets,
        };
    }, [theme, projectFlagTrends]);

    return data;
};
