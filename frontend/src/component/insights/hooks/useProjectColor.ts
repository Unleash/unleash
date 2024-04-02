import { useMemo } from 'react';
import { useTheme } from '@mui/material';
import useProjects from 'hooks/api/getters/useProjects/useProjects';

export const useProjectColor = () => {
    const { projects } = useProjects();
    const theme = useTheme();
    const colors = theme.palette.charts.series;

    const projectsSortedByCreatedAt = useMemo(
        () =>
            projects
                .sort(
                    (a, b) =>
                        new Date(a.createdAt).getTime() -
                        new Date(b.createdAt).getTime(),
                )
                .map((project) => project.id),
        [projects],
    );

    const getProjectColor = (str: string): string => {
        const index = projectsSortedByCreatedAt.indexOf(str);
        return colors[index % colors.length];
    };

    return getProjectColor;
};
