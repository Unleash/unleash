import { useState } from 'react';
import type { OnChangeFn, SortingState } from '@tanstack/react-table';
import { useTracking } from 'hooks/useTracking';
import type { TableTracking } from 'hooks/useTableState';

export const useTrackedSorting = (
    initialSorting: SortingState,
    tracking: TableTracking,
) => {
    const [sorting, setSorting] = useState(initialSorting);
    const trackSort = useTracking({ ...tracking, type: 'sort-table' });

    const onSortingChange: OnChangeFn<SortingState> = (updater) => {
        const newSorting =
            typeof updater === 'function' ? updater(sorting) : updater;
        setSorting(newSorting);
        // Shift-click sorts by several columns, so send them all in priority order.
        trackSort('succeeded', {
            column: newSorting.map(({ id }) => id).join(','),
            direction: newSorting
                .map(({ desc }) => (desc ? 'desc' : 'asc'))
                .join(','),
        });
    };

    return { sorting, onSortingChange };
};
