import { useEffect, useState } from 'react';
import { getLocalStorageItem, setLocalStorageItem } from '../utils/storage.js';
import { basePath } from 'utils/formatPath';
import { useCustomEvent } from './useCustomEvent.js';

export const useLastViewedProject = () => {
    const key = `${basePath}:unleash-lastViewedProject`;

    const [lastViewed, setLastViewed] = useState<string | undefined>(() => {
        return getLocalStorageItem(key);
    });

    const { emitEvent } = useCustomEvent('lastViewedProjectUpdated', () => {
        setLastViewed(getLocalStorageItem(key));
    });

    useEffect(() => {
        if (lastViewed) {
            setLocalStorageItem(key, lastViewed);
            emitEvent();
        }
    }, [lastViewed, key, emitEvent]);

    return {
        lastViewed,
        setLastViewed,
    };
};
