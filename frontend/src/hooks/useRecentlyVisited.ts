import { useCallback, useEffect, useState } from 'react';
import { getLocalStorageItem, setLocalStorageItem } from '../utils/storage.js';
import { basePath } from 'utils/formatPath';
import { useCustomEvent } from './useCustomEvent.js';

const RECENTLY_VISITED_PAGES_UPDATED_EVENT = 'recentlyVisitedPagesUpdated';
const MAX_ITEMS = 5;

export type LastViewedPage = {
    featureId?: string;
    projectId?: string;
    pathName?: string;
};

const localStorageItems = (key: string): LastViewedPage[] => {
    return getLocalStorageItem(key) || [];
};

export const useRecentlyVisited = () => {
    const key = `${basePath}:unleash-lastVisitedPages`;

    const [lastVisited, setLastVisited] = useState<LastViewedPage[]>(
        localStorageItems(key),
    );

    const { emitEvent } = useCustomEvent(
        RECENTLY_VISITED_PAGES_UPDATED_EVENT,
        () => {
            setLastVisited(localStorageItems(key));
        },
    );

    useEffect(() => {
        if (lastVisited) {
            setLocalStorageItem(key, lastVisited);
            emitEvent();
        }
    }, [JSON.stringify(lastVisited), key, emitEvent]);

    const pageEquals = (existing: LastViewedPage, page: LastViewedPage) => {
        if (existing.featureId && existing.featureId === page.featureId)
            return true;
        if (existing.pathName && existing.pathName === page.pathName)
            return true;
        if (
            existing.projectId &&
            !existing.featureId &&
            !page.featureId &&
            existing.projectId === page.projectId
        )
            return true;
        return false;
    };

    const setCappedLastVisited = useCallback(
        (page: LastViewedPage) => {
            if (page.featureId && !page.projectId) return;
            const filtered = lastVisited.filter(
                (item) => !pageEquals(item, page),
            );
            const updatedLastVisited = [page, ...filtered];

            const sliced =
                updatedLastVisited.length > MAX_ITEMS
                    ? updatedLastVisited.slice(0, MAX_ITEMS)
                    : updatedLastVisited;
            setLastVisited(sliced);
        },
        [JSON.stringify(lastVisited)],
    );

    return {
        lastVisited,
        setLastVisited: setCappedLastVisited,
    };
};
