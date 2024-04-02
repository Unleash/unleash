import { useMemo } from 'react';
import type { InstanceInsightsSchema } from 'openapi';
import { useProjectColor } from './useProjectColor';
import { useTheme } from '@mui/material';
import type { GroupedDataByProject } from './useGroupedProjectTrends';

type ProjectFlagTrends = InstanceInsightsSchema['projectFlagTrends'];

export const useProjectChartData = (
    projectFlagTrends: GroupedDataByProject<ProjectFlagTrends>,
) => {
    const theme = useTheme();
    const getProjectColor = useProjectColor();

    const data = useMemo(() => {
        const datasets = Object.entries(projectFlagTrends).map(
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
