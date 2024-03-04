import { createLocalStorage } from '../utils/createLocalStorage';

export type IFeedbackCategory =
    | 'search'
    | 'newStrategyForm'
    | 'insights'
    | 'applicationOverview';

export const useUserSubmittedFeedback = (category: IFeedbackCategory) => {
    const key = `unleash-userSubmittedFeedback:${category}`;

    const { value: hasSubmittedFeedback, setValue: setHasSubmittedFeedback } =
        createLocalStorage<Boolean>(key, false);
    return {
        hasSubmittedFeedback,
        setHasSubmittedFeedback,
    };
};
