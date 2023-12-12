import { useMediaQuery, useTheme } from '@mui/material';
import { useCallback } from 'react';

const staticColumns = ['select', 'actions', 'name', 'favorite'];

const formatAsObject = (columnIds: string[]): Record<string, boolean> =>
    columnIds.reduce(
        (acc, columnId) => ({
            ...acc,
            [columnId]: true,
        }),
        {},
    );

export const useDefaultColumnVisibility = (dynamicColumnIds: string[]) => {
    const theme = useTheme();
    const isTinyScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const isMediumScreen = useMediaQuery(theme.breakpoints.down('lg'));

    const showEnvironments = useCallback(
        (environmentsToShow: number = 0) =>
            dynamicColumnIds
                .filter((id) => id.startsWith('environment:') !== false)
                .slice(0, environmentsToShow),
        [dynamicColumnIds],
    );

    if (isTinyScreen) {
        return formatAsObject([...staticColumns, 'createdAt']);
    }
    if (isSmallScreen) {
        return formatAsObject([
            ...staticColumns,
            'createdAt',
            ...showEnvironments(1),
        ]);
    }
    if (isMediumScreen) {
        return formatAsObject([
            ...staticColumns,
            'createdAt',
            'type',
            ...showEnvironments(1),
        ]);
    }

    return formatAsObject([
        ...staticColumns,
        'lastSeenAt',
        'createdAt',
        'type',
        ...showEnvironments(2),
    ]);
};
