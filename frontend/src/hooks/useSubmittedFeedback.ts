import { createLocalStorage } from '../utils/createLocalStorage.js';

export type IFeedbackCategory =
    | 'search'
    | 'insights'
    | 'applicationOverview'
    | 'newProjectOverview'
    | 'signals'
    | 'projectStatus';

export const useUserSubmittedFeedback = (category: IFeedbackCategory) => {
    const key = `unleash-userSubmittedFeedback:${category}`;

    const { value: hasSubmittedFeedback, setValue: setHasSubmittedFeedback } =
        createLocalStorage<Boolean>(key, false);
    return {
        hasSubmittedFeedback,
        setHasSubmittedFeedback,
    };
};
