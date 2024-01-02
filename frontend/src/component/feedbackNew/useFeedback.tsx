import {
    IFeedbackCategory,
    useUserSubmittedFeedback,
} from 'hooks/useSubmittedFeedback';
import { FeedbackContext } from './FeedbackContext';
import { useContext } from 'react';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

type OpenFeedbackParams = {
    title: string;
    positiveLabel: string;
    areasForImprovementsLabel: string;
};

export const useFeedback = (feedbackCategory: IFeedbackCategory) => {
    const context = useContext(FeedbackContext);
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

    if (!context) {
        throw new Error('useFeedback must be used within a FeedbackProvider');
    }

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
