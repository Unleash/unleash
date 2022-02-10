import { IAuthFeedback, useAuthEndpoint } from './useAuthEndpoint';

interface IUseAuthFeedbackOutput {
    feedback?: IAuthFeedback[];
    refetchFeedback: () => void;
    loading: boolean;
    error?: Error;
}

export const useAuthFeedback = (): IUseAuthFeedbackOutput => {
    const auth = useAuthEndpoint();
    const feedback =
        auth.data && 'feedback' in auth.data ? auth.data.feedback : undefined;

    return {
        feedback,
        refetchFeedback: auth.refetchAuth,
        loading: auth.loading,
        error: auth.error,
    };
};
