import { useEffect, useState } from 'react';
import { getLocalStorageItem, setLocalStorageItem } from '../utils/storage';
import useUiConfig from './api/getters/useUiConfig/useUiConfig';

export const useLastViewedProject = () => {
    const { uiConfig } = useUiConfig();
    const key = `${uiConfig.baseUriPath}:unleash-lastViewedProject`;

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
