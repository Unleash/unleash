import { IInternalBanner } from 'interfaces/banner';
import useAPI from '../useApi/useApi';
import { ProvideFeedbackSchema } from '../../../../openapi';

const ENDPOINT = 'api/admin/user-feedback';

export const useUserFeedbackApi = () => {
    const { loading, makeRequest, createRequest, errors } = useAPI({
        propagateErrors: true,
    });

    const addFeedback = async (feedbackSchema: ProvideFeedbackSchema) => {
        const requestId = 'addBanner';
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
        errors,
        loading,
    };
};
