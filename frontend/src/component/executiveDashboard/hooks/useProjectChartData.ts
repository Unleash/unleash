import { useMemo } from 'react';
import {
    ExecutiveSummarySchema,
    ExecutiveSummarySchemaProjectFlagTrendsItem,
} from '../../../openapi';
import { getProjectColor } from '../executive-dashboard-utils';
import { useTheme } from '@mui/material';

type ProjectFlagTrends = ExecutiveSummarySchema['projectFlagTrends'];

export const useProjectChartData = (projectFlagTrends: ProjectFlagTrends) => {
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
    }, [theme, projectFlagTrends]);

    return data;
};
