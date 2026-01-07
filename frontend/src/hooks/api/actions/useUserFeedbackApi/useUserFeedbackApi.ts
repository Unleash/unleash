import type { ProvideFeedbackSchema } from 'openapi';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

const ENDPOINT = 'https://app.unleash-hosted.com/hosted/feedback';

export const useUserFeedbackApi = () => {
    const { uiConfig } = useUiConfig();

    const addFeedback = async (feedbackSchema: ProvideFeedbackSchema) => {
        await fetch(uiConfig.feedbackUriPath || ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(feedbackSchema),
        });
    };

    return {
        addFeedback,
    };
};
