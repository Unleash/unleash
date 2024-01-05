import { useEffect, useState } from 'react';
import { getLocalStorageItem, setLocalStorageItem } from '../utils/storage';
import { basePath } from 'utils/formatPath';
import { createLocalStorage } from '../utils/createLocalStorage';

export type IFeedbackCategory = 'search' | 'newStrategyForm';

export const useUserSubmittedFeedback = (category: IFeedbackCategory) => {
    const key = `unleash-userSubmittedFeedback:${category}`;

    const { value: hasSubmittedFeedback, setValue: setHasSubmittedFeedback } =
        createLocalStorage<Boolean>(key, false);
    return {
        hasSubmittedFeedback,
        setHasSubmittedFeedback,
    };
};
