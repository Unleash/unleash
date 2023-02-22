import { useMemo, useState } from 'react';
import { sortTypes } from 'utils/sortTypes';
import type { Row, SortByFn } from 'react-table';
import { usePlausibleTracker } from './usePlausibleTracker';

type WithFavorite = {
    favorite: boolean;
    [key: string]: any;
};

export const sortTypesWithFavorites: Record<
    keyof typeof sortTypes,
    SortByFn<object> // TODO: possible type improvement in react-table v8
> = Object.assign(
    {},
    ...Object.entries(sortTypes).map(([key, value]) => ({
        [key]: (
            v1: Row<WithFavorite>,
            v2: Row<WithFavorite>,
            id: string,
            desc?: boolean
        ) => {
            if (v1?.original?.favorite && !v2?.original?.favorite)
                return desc ? 1 : -1;
            if (!v1?.original?.favorite && v2?.original?.favorite)
                return desc ? -1 : 1;
            return value(v1, v2, id, desc);
        },
    }))
);

/**
 * Move favorites to the top of the list.
 */
export const usePinnedFavorites = (initialState = false) => {
    const [isFavoritesPinned, setIsFavoritesPinned] = useState(initialState);
    const { trackEvent } = usePlausibleTracker();

    const onChangeIsFavoritePinned = (newState: boolean) => {
        trackEvent('favorite', {
            props: {
                eventType: `features ${!newState ? 'un' : ''}pinned `,
            },
        });
        setIsFavoritesPinned(newState);
    };

    const enhancedSortTypes = useMemo(() => {
        return isFavoritesPinned ? sortTypesWithFavorites : sortTypes;
    }, [isFavoritesPinned]);

    return {
        isFavoritesPinned,
        onChangeIsFavoritePinned,
        sortTypes: enhancedSortTypes,
    };
};
