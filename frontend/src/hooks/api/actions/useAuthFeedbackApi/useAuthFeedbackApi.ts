import { formatApiPath } from 'utils/formatPath';
import { useCallback } from 'react';
import { useAuthFeedback } from 'hooks/api/getters/useAuth/useAuthFeedback';
import { IAuthFeedback } from 'hooks/api/getters/useAuth/useAuthEndpoint';

interface IUseAuthFeedbackApi {
    createFeedback: (feedback: IAuthFeedback) => Promise<void>;
    updateFeedback: (feedback: IAuthFeedback) => Promise<void>;
}

export const useAuthFeedbackApi = (): IUseAuthFeedbackApi => {
    const { refetchFeedback } = useAuthFeedback();
    const path = formatApiPath('api/admin/feedback');

    const createFeedback = useCallback(
        async (feedback: IAuthFeedback): Promise<void> => {
            await sendFeedback('POST', path, feedback);
            await refetchFeedback();
        },
        [path, refetchFeedback]
    );

    const updateFeedback = useCallback(
        async (feedback: IAuthFeedback): Promise<void> => {
            const pathWithId = `${path}/${feedback.feedbackId}`;
            await sendFeedback('PUT', pathWithId, feedback);
            await refetchFeedback();
        },
        [path, refetchFeedback]
    );

    return {
        createFeedback,
        updateFeedback,
    };
};

const sendFeedback = async (
    method: 'PUT' | 'POST',
    path: string,
    feedback: IAuthFeedback
): Promise<void> => {
    await fetch(path, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback),
    });
};
