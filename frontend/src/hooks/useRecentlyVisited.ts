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

const removeIncorrect = (flags?: any[]): LastViewedPage[] => {
    if (!Array.isArray(flags)) return [];
    return flags.filter(
        (flag) =>
            (flag.featureId && flag.projectId) ||
            flag.projectId ||
            flag.pathName,
    );
};

const localStorageItems = (key: string) => {
    return removeIncorrect(getLocalStorageItem(key) || []);
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
            setCappedLastVisited([{ pathName: path.path }]);
        } else {
            if (featureMatch?.params.featureId) {
                setCappedLastVisited([
                    {
                        featureId: featureMatch?.params.featureId,
                        projectId: featureMatch?.params.projectId,
                    },
                ]);
            } else if (projectMatch?.params.projectId) {
                setCappedLastVisited([
                    { projectId: projectMatch?.params.projectId },
                ]);
            }
        }
    }, [location, featureMatch, projectMatch]);

    useEffect(() => {
        if (lastVisited) {
            setLocalStorageItem(key, lastVisited);
            emitEvent();
        }
    }, [JSON.stringify(lastVisited), key, emitEvent]);

    const setCappedLastVisited = useCallback(
        (pages: LastViewedPage[]) => {
            const filtered = pages.filter((page) => {
                if (page.featureId && !page.projectId) return false;
                if (
                    lastVisited.find(
                        (item) =>
                            item.featureId && item.featureId === page.featureId,
                    )
                )
                    return false;
                if (
                    lastVisited.find(
                        (item) =>
                            item.pathName && item.pathName === page.pathName,
                    )
                )
                    return false;
                if (
                    lastVisited.find(
                        (item) =>
                            item.projectId &&
                            !item.featureId &&
                            !page.featureId &&
                            item.projectId === page.projectId,
                    )
                )
                    return false;
                return true;
            });

            const updatedLastVisited = removeIncorrect([
                ...lastVisited,
                ...filtered,
            ]);
            const sliced =
                updatedLastVisited.length > MAX_ITEMS
                    ? updatedLastVisited.slice(-MAX_ITEMS)
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
