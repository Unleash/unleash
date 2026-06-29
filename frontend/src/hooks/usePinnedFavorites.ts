import { useMemo, useState } from 'react';
import { sortingFns } from 'utils/sortingFns';
import type { Row, SortingFn } from '@tanstack/react-table';
import { useEventTracker } from './useEventTracker.js';

type WithFavorite = {
    favorite: boolean;
    [key: string]: unknown;
};

export const sortingFnsWithFavorites: Record<
    keyof typeof sortingFns,
    SortingFn<WithFavorite>
> = Object.assign(
    {},
    ...Object.entries(sortingFns).map(([key, value]) => ({
        [key]: (
            rowA: Row<WithFavorite>,
            rowB: Row<WithFavorite>,
            columnId: string,
        ) => {
            if (rowA.original.favorite && !rowB.original.favorite) {
                return -1;
            }
            if (!rowA.original.favorite && rowB.original.favorite) {
                return 1;
            }
            return value(rowA, rowB, columnId);
        },
    })),
);

/**
 * Move favorites to the top of the list.
 */
export const usePinnedFavorites = (initialState = false) => {
    const [isFavoritesPinned, setIsFavoritesPinned] = useState(initialState);
    const { trackEvent } = useEventTracker();

    const onChangeIsFavoritePinned = (newState: boolean) => {
        trackEvent('favorite', {
            props: {
                eventType: `features ${!newState ? 'un' : ''}pinned `,
            },
        });
        setIsFavoritesPinned(newState);
    };

    const enhancedSortingFns = useMemo(() => {
        return isFavoritesPinned ? sortingFnsWithFavorites : sortingFns;
    }, [isFavoritesPinned]);

    return {
        isFavoritesPinned,
        onChangeIsFavoritePinned,
        sortingFns: enhancedSortingFns,
    };
};
