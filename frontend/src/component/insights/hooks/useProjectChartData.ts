import { useMemo } from 'react';
import type { InstanceInsightsSchema } from 'openapi';
import { useProjectColor } from './useProjectColor.js';
import { useTheme } from '@mui/material';
import type { GroupedDataByProject } from './useGroupedProjectTrends.js';
import useProjects from 'hooks/api/getters/useProjects/useProjects';

type ProjectFlagTrends = InstanceInsightsSchema['projectFlagTrends'];
type LifecycleTrends = InstanceInsightsSchema['lifecycleTrends'];
type CreationArchiveTrends = InstanceInsightsSchema['creationArchiveTrends'];

export const calculateTechDebt = (item: {
    total: number;
    stale: number;
    potentiallyStale: number;
}) => {
    if (!item.total) {
        return '0';
    }

    return (((item.stale + item.potentiallyStale) / item.total) * 100).toFixed(
        2,
    );
};

export const useProjectChartData = (
    projectFlagTrends:
        | GroupedDataByProject<ProjectFlagTrends>
        | GroupedDataByProject<LifecycleTrends>
        | GroupedDataByProject<CreationArchiveTrends>,
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
