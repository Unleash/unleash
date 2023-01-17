import { useEffect, useState } from 'react';
import { getLocalStorageItem, setLocalStorageItem } from '../utils/storage';
import { basePath } from 'utils/formatPath';

export const useLastViewedProject = () => {
    const key = `${basePath}:unleash-lastViewedProject`;

    const [lastViewed, setLastViewed] = useState(() => {
        return getLocalStorageItem(key);
    });

    useEffect(() => {
        if (lastViewed) {
            setLocalStorageItem(key, lastViewed);
        }
    }, [lastViewed, key]);

    return {
        lastViewed,
        setLastViewed,
    };
};
