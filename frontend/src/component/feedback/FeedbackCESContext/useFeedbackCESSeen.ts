import { useAuthFeedback } from 'hooks/api/getters/useAuth/useAuthFeedback';
import { useAuthFeedbackApi } from 'hooks/api/actions/useAuthFeedbackApi/useAuthFeedbackApi';
import { IFeedbackCESState } from 'component/feedback/FeedbackCESContext/FeedbackCESContext';
import { useCallback } from 'react';

interface IUseFeedbackCESSeen {
    setSeen: (state: IFeedbackCESState) => void;
    isSeen: (state: IFeedbackCESState) => boolean;
}

export const useFeedbackCESSeen = (): IUseFeedbackCESSeen => {
    const { createFeedback } = useAuthFeedbackApi();
    const { feedback } = useAuthFeedback();

    const isSeen = useCallback(
        (state: IFeedbackCESState) =>
            !!feedback &&
            feedback.some(f => f.feedbackId === formatFeedbackCESId(state)),
        [feedback]
    );

    const setSeen = useCallback(
        (state: IFeedbackCESState) =>
            createFeedback({ feedbackId: formatFeedbackCESId(state) }),
        [createFeedback]
    );

    return {
        isSeen,
        setSeen,
    };
};

const formatFeedbackCESId = (state: IFeedbackCESState): string => {
    return `ces${state.path}`;
};
