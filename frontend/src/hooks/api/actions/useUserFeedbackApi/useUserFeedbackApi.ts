import { IInternalBanner } from 'interfaces/banner';
import useAPI from '../useApi/useApi';
import { ProvideFeedbackSchema } from '../../../../openapi';
import useUiConfig from '../../getters/useUiConfig/useUiConfig';

const ENDPOINT = 'feedback';

export const useUserFeedbackApi = () => {
    const { uiConfig } = useUiConfig();

    const { loading, makeRequest, createRequest, errors } = useAPI({
        propagateErrors: true,
    });

    const addFeedback = async (feedbackSchema: ProvideFeedbackSchema) => {
        if (uiConfig.feedbackUriPath !== undefined) {
            await fetch(uiConfig.feedbackUriPath, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(feedbackSchema),
            });
        } else {
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
        }
    };

    return {
        addFeedback,
        errors,
        loading,
    };
};
