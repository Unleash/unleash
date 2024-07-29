import { useMemo } from 'react';
import type { InstanceInsightsSchema } from 'openapi';
import { useProjectColor } from './useProjectColor';
import { useTheme } from '@mui/material';
import type { GroupedDataByProject } from './useGroupedProjectTrends';
import useProjects from 'hooks/api/getters/useProjects/useProjects';

type ProjectFlagTrends = InstanceInsightsSchema['projectFlagTrends'];

export const useProjectChartData = (
    projectFlagTrends: GroupedDataByProject<ProjectFlagTrends>,
) => {
    const theme = useTheme();
    const getProjectColor = useProjectColor();
    const { projects } = useProjects();
    const projectNames = new Map(
        projects.map((project) => [project.id, project.name]),
    );

    const data = useMemo(() => {
        const datasets = Object.entries(projectFlagTrends).map(
            ([project, trends]) => {
                const color = getProjectColor(project);
                return {
                    label: projectNames.get(project) || project,
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
