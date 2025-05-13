import { useCallback, useEffect, useState } from 'react';
import { getLocalStorageItem, setLocalStorageItem } from '../utils/storage.js';
import { basePath } from 'utils/formatPath';
import { useCustomEvent } from './useCustomEvent.js';

const MAX_ITEMS = 3;

export type LastViewedFlag = { featureId: string; projectId: string };

const removeIncorrect = (flags?: any[]): LastViewedFlag[] => {
    if (!Array.isArray(flags)) return [];
    return flags.filter((flag) => flag.featureId && flag.projectId);
};

const localStorageItems = (key: string) => {
    return removeIncorrect(getLocalStorageItem(key) || []);
};

export const useLastViewedFlags = () => {
    const key = `${basePath}:unleash-lastViewedFlags`;
    const [lastViewed, setLastViewed] = useState<LastViewedFlag[]>(() =>
        localStorageItems(key),
    );

    const { emitEvent } = useCustomEvent(
        'lastViewedFlagsUpdated',
        useCallback(() => {
            setLastViewed(localStorageItems(key));
        }, [key]),
    );

    useEffect(() => {
        if (lastViewed) {
            setLocalStorageItem(key, lastViewed);
            emitEvent();
        }
    }, [JSON.stringify(lastViewed), key, emitEvent]);

    const setCappedLastViewed = useCallback(
        (flag: { featureId: string; projectId: string }) => {
            if (!flag.featureId || !flag.projectId) return;
            if (lastViewed.find((item) => item.featureId === flag.featureId))
                return;
            const updatedLastViewed = removeIncorrect([...lastViewed, flag]);
            setLastViewed(
                updatedLastViewed.length > MAX_ITEMS
                    ? updatedLastViewed.slice(-MAX_ITEMS)
                    : updatedLastViewed,
            );
        },
        [JSON.stringify(lastViewed)],
    );

    return { lastViewed, setLastViewed: setCappedLastViewed };
};
