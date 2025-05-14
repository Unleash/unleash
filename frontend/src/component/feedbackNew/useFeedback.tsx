import {
    type IFeedbackCategory,
    useUserSubmittedFeedback,
} from 'hooks/useSubmittedFeedback';
import {
    FeedbackContext,
    type FeedbackMode,
    type IFeedbackContext,
} from './FeedbackContext.ts';
import { useContext } from 'react';

type OpenFeedbackParams = {
    title: string;
    positiveLabel: string;
    areasForImprovementsLabel: string;
};

export const useFeedbackContext = (): IFeedbackContext => {
    const context = useContext(FeedbackContext);

    if (!context) {
        throw new Error(
            'useFeedbackContext must be used within a FeedbackProvider',
        );
    }

    return context;
};

export const useFeedback = (
    feedbackCategory: IFeedbackCategory,
    mode: FeedbackMode,
    variant: string = '',
) => {
    const context = useFeedbackContext();
    const { hasSubmittedFeedback } = useUserSubmittedFeedback(feedbackCategory);

    return {
        ...context,
        hasSubmittedFeedback,
        openFeedback: (parameters: OpenFeedbackParams) => {
            context.openFeedback(
                {
                    ...parameters,
                    category: feedbackCategory,
                },
                mode,
                variant,
            );
        },
    };
};
