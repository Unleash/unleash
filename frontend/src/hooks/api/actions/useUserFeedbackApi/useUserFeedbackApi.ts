import { IInternalBanner } from 'interfaces/banner';
import useAPI from '../useApi/useApi';
import { ProvideFeedbackSchema } from '../../../../openapi';

const DIRECT_ENDPOINT = 'https://sandbox.getunleash.io/enterprise/feedback';
const ENDPOINT = 'feedback';

export const useUserFeedbackApi = () => {
    const addDirectFeedback = async (feedbackSchema: ProvideFeedbackSchema) => {
        await fetch(DIRECT_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(feedbackSchema),
        });
    };
    const { loading, makeRequest, createRequest, errors } = useAPI({
        propagateErrors: true,
    });

    const addFeedback = async (feedbackSchema: ProvideFeedbackSchema) => {
        const requestId = 'addFeedback';
        const req = createRequest(
            ENDPOINT,
            {
                method: 'POST',
                body: JSON.stringify(feedbackSchema),
            },
            requestId,
        );

        const response = await makeRequest(req.caller, req.id);
        return response.json();
    };

    return {
        addFeedback,
        addDirectFeedback,
        errors,
        loading,
    };
};
