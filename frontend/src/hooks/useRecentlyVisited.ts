import { useCallback, useEffect, useState } from 'react';
import { useLocation, useMatch } from 'react-router-dom';
import { routes } from 'component/menu/routes';
import { getLocalStorageItem, setLocalStorageItem } from '../utils/storage';
import { basePath } from 'utils/formatPath';
import { useCustomEvent } from './useCustomEvent';

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
    const featureMatch = useMatch('/projects/:projectId/features/:featureId');
    const projectMatch = useMatch('/projects/:projectId');

    const [lastVisited, setLastVisited] = useState<LastViewedPage[]>(
        localStorageItems(key),
    );

    const { emitEvent } = useCustomEvent(
        RECENTLY_VISITED_PAGES_UPDATED_EVENT,
        () => {
            setLastVisited(localStorageItems(key));
        },
    );

    const location = useLocation();

    useEffect(() => {
        if (!location.pathname) return;

        const path = routes.find((r) => r.path === location.pathname);
        if (path) {
            setCappedLastVisited({ pathName: path.path });
        } else if (featureMatch?.params.featureId) {
            setCappedLastVisited({
                featureId: featureMatch?.params.featureId,
                projectId: featureMatch?.params.projectId,
            });
        } else if (projectMatch?.params.projectId) {
            setCappedLastVisited({
                projectId: projectMatch?.params.projectId,
            });
        }
    }, [location, featureMatch, projectMatch]);

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
