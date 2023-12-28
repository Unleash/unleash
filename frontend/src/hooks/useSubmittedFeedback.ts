import { useEffect, useState } from 'react';
import { getLocalStorageItem, setLocalStorageItem } from '../utils/storage';
import { basePath } from 'utils/formatPath';

export type IFeedbackCategory = 'search';

export const useUserSubmittedFeedback = (category: IFeedbackCategory) => {
    const key = `${basePath}:unleash-userSubmittedFeedback:${category}`;

    const [hasSubmittedFeedback, setHasSubmittedFeedback] = useState(() => {
        return getLocalStorageItem<boolean>(key) || false;
    });

    useEffect(() => {
        setLocalStorageItem(key, hasSubmittedFeedback);
    }, [hasSubmittedFeedback, key]);

    return {
        hasSubmittedFeedback,
        setHasSubmittedFeedback,
    };
};
