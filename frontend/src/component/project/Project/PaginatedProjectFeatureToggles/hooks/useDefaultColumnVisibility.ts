import { useCallback } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import type { VisibilityState } from '@tanstack/react-table';

const staticColumns = ['select', 'actions', 'name', 'favorite'];

const formatAsColumnVisibility = (
    allColumns: string[],
    visibleColumns: string[],
): VisibilityState =>
    allColumns.reduce(
        (acc, columnId) => ({
            ...acc,
            [columnId]: visibleColumns.includes(columnId),
        }),
        {},
    );

export const useDefaultColumnVisibility = (allColumnIds: string[]) => {
    const theme = useTheme();
    const isTinyScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const isMediumScreen = useMediaQuery(theme.breakpoints.down('lg'));

    const showEnvironments = useCallback(
        (_environmentsToShow: number = 0) =>
            allColumnIds.filter((id) => id.startsWith('environment:')),
        [allColumnIds],
    );

    if (isTinyScreen) {
        return formatAsColumnVisibility(allColumnIds, [
            ...staticColumns,
            'createdAt',
        ]);
    }
    if (isSmallScreen) {
        return formatAsColumnVisibility(allColumnIds, [
            ...staticColumns,
            'createdAt',
            ...showEnvironments(1),
        ]);
    }
    if (isMediumScreen) {
        return formatAsColumnVisibility(allColumnIds, [
            ...staticColumns,
            'createdAt',
            'type',
            ...showEnvironments(1),
        ]);
    }

    return formatAsColumnVisibility(allColumnIds, [
        ...staticColumns,
        'lastSeenAt',
        'lifecycle',
        'createdAt',
        'createdBy',
        'type',
        'tags',
        ...showEnvironments(3),
    ]);
};
