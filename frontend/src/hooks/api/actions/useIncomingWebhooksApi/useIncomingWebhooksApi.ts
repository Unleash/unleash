import { IIncomingWebhook } from 'interfaces/incomingWebhook';
import useAPI from '../useApi/useApi';

const ENDPOINT = 'api/admin/incoming-webhooks';

export type IncomingWebhookPayload = Omit<
    IIncomingWebhook,
    'id' | 'createdAt' | 'createdByUserId' | 'tokens'
>;

export const useIncomingWebhooksApi = () => {
    const { loading, makeRequest, createRequest, errors } = useAPI({
        propagateErrors: true,
    });

    const addIncomingWebhook = async (
        incomingWebhook: IncomingWebhookPayload,
    ) => {
        const requestId = 'addIncomingWebhook';
        const req = createRequest(
            ENDPOINT,
            {
                method: 'POST',
                body: JSON.stringify(incomingWebhook),
            },
            requestId,
        );

        const response = await makeRequest(req.caller, req.id);
        return response.json();
    };

    const updateIncomingWebhook = async (
        incomingWebhookId: number,
        incomingWebhook: IncomingWebhookPayload,
    ) => {
        const requestId = 'updateIncomingWebhook';
        const req = createRequest(
            `${ENDPOINT}/${incomingWebhookId}`,
            {
                method: 'PUT',
                body: JSON.stringify(incomingWebhook),
            },
            requestId,
        );

        await makeRequest(req.caller, req.id);
    };

    const enableIncomingWebhook = async (incomingWebhookId: number) => {
        const requestId = 'enableIncomingWebhook';
        const req = createRequest(
            `${ENDPOINT}/${incomingWebhookId}/on`,
            {
                method: 'POST',
            },
            requestId,
        );

        await makeRequest(req.caller, req.id);
    };

    const disableIncomingWebhook = async (incomingWebhookId: number) => {
        const requestId = 'disableIncomingWebhook';
        const req = createRequest(
            `${ENDPOINT}/${incomingWebhookId}/off`,
            {
                method: 'POST',
            },
            requestId,
        );

        await makeRequest(req.caller, req.id);
    };

    const toggleIncomingWebhook = async (
        incomingWebhookId: number,
        enabled: boolean,
    ) => {
        if (enabled) {
            await enableIncomingWebhook(incomingWebhookId);
        } else {
            await disableIncomingWebhook(incomingWebhookId);
        }
    };

    const removeIncomingWebhook = async (incomingWebhookId: number) => {
        const requestId = 'removeIncomingWebhook';
        const req = createRequest(
            `${ENDPOINT}/${incomingWebhookId}`,
            { method: 'DELETE' },
            requestId,
        );

        await makeRequest(req.caller, req.id);
    };

    return {
        addIncomingWebhook,
        updateIncomingWebhook,
        removeIncomingWebhook,
        toggleIncomingWebhook,
        errors,
        loading,
    };
};
