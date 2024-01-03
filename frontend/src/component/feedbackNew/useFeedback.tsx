import {
    IFeedbackCategory,
    useUserSubmittedFeedback,
} from 'hooks/useSubmittedFeedback';
import { FeedbackContext, IFeedbackContext } from './FeedbackContext';
import { useContext } from 'react';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

type OpenFeedbackParams = {
    title: string;
    positiveLabel: string;
    areasForImprovementsLabel: string;
};

export const useFeedbackContext: IFeedbackContext = () => {
    const context = useContext(FeedbackContext);

    if (!context) {
        throw new Error(
            'useFeedbackContext must be used within a FeedbackProvider',
        );
    }

    return context;
};

export const useFeedback = (feedbackCategory: IFeedbackCategory) => {
    const context = useFeedbackContext();
    const { hasSubmittedFeedback } = useUserSubmittedFeedback(feedbackCategory);

    const { isPro, isOss, isEnterprise } = useUiConfig();

    const getUserType = () => {
        if (isPro()) {
            return 'pro';
        }

        if (isOss()) {
            return 'oss';
        }

        if (isEnterprise()) {
            return 'enterprise';
        }

        return 'unknown';
    };

    return {
        ...context,
        hasSubmittedFeedback,
        openFeedback: (parameters: OpenFeedbackParams) => {
            context.openFeedback({
                ...parameters,
                category: feedbackCategory,
                userType: getUserType(),
            });
        },
    };
};
