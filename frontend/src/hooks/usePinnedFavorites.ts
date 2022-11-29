import { useMemo, useState } from 'react';
import { sortTypes } from 'utils/sortTypes';

const sortTypesWithFavorites = Object.fromEntries(
    Object.entries(sortTypes).map(([key, value]) => [
        key,
        (v1: any, v2: any, id: string, desc?: boolean) => {
            if (v1?.original?.favorite && !v2?.original?.favorite)
                return desc ? 1 : -1;
            if (!v1?.original?.favorite && v2?.original?.favorite)
                return desc ? -1 : 1;
            return value(v1, v2, id);
        },
    ])
);

/**
 * Move favorites to the top of the list.
 */
export const usePinnedFavorites = (initialState = false) => {
    const [isFavoritesPinned, setIsFavoritesPinned] = useState(initialState);

    const onTogglePinFavorites = () => {
        setIsFavoritesPinned(!isFavoritesPinned);
    };

    const enhancedSortTypes = useMemo(
        () => (isFavoritesPinned ? sortTypesWithFavorites : sortTypes),
        [isFavoritesPinned]
    );

    return {
        isFavoritesPinned,
        onTogglePinFavorites,
        sortTypes: enhancedSortTypes,
    };
};
