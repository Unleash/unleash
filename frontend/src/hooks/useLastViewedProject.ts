import { useEffect, useState } from 'react';
import { setSessionStorageItem, getSessionStorageItem } from '../utils/storage';
import useUiConfig from './api/getters/useUiConfig/useUiConfig';

export const useLastViewedProject = () => {
    const { uiConfig } = useUiConfig();
    const key = `${uiConfig.baseUriPath}:unleash-lastViewedProject`;

    const [lastViewed, setLastViewed] = useState(() => {
        return getSessionStorageItem(key);
    });

    useEffect(() => {
        if (lastViewed) {
            setSessionStorageItem(key, lastViewed);
        }
    }, [lastViewed, key]);

    return {
        lastViewed,
        setLastViewed,
    };
};
