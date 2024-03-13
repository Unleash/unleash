import { useMemo } from 'react';
import {
    ExecutiveSummarySchema,
    ExecutiveSummarySchemaProjectFlagTrendsItem,
} from '../../../openapi';
import { useProjectColor } from './useProjectColor';
import { useTheme } from '@mui/material';

type ProjectFlagTrends = ExecutiveSummarySchema['projectFlagTrends'];

export const useProjectChartData = (projectFlagTrends: ProjectFlagTrends) => {
    const theme = useTheme();
    const getProjectColor = useProjectColor();

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
