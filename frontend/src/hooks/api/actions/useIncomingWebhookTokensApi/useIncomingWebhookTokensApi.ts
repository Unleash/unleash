import { IIncomingWebhookToken } from 'interfaces/incomingWebhook';
import useAPI from '../useApi/useApi';

const ENDPOINT = 'api/admin/incoming-webhooks';

export type AddOrUpdateIncomingWebhookToken = Omit<
    IIncomingWebhookToken,
    'id' | 'incomingWebhookId' | 'createdAt' | 'createdByUserId'
>;

export type IncomingWebhookTokenWithTokenSecret = IIncomingWebhookToken & {
    token: string;
};

export const useIncomingWebhookTokensApi = () => {
    const { loading, makeRequest, createRequest, errors } = useAPI({
        propagateErrors: true,
    });

    const addIncomingWebhookToken = async (
        incomingWebhookId: number,
        incomingWebhookToken: AddOrUpdateIncomingWebhookToken,
    ): Promise<IncomingWebhookTokenWithTokenSecret> => {
        const requestId = 'addIncomingWebhookToken';
        const req = createRequest(
            `${ENDPOINT}/${incomingWebhookId}/tokens`,
            {
                method: 'POST',
                body: JSON.stringify(incomingWebhookToken),
            },
            requestId,
        );

        const response = await makeRequest(req.caller, req.id);
        return response.json();
    };

    const updateIncomingWebhookToken = async (
        incomingWebhookId: number,
        incomingWebhookTokenId: number,
        incomingWebhookToken: AddOrUpdateIncomingWebhookToken,
    ) => {
        const requestId = 'updateIncomingWebhookToken';
        const req = createRequest(
            `${ENDPOINT}/${incomingWebhookId}/tokens/${incomingWebhookTokenId}`,
            {
                method: 'PUT',
                body: JSON.stringify(incomingWebhookToken),
            },
            requestId,
        );

        await makeRequest(req.caller, req.id);
    };

    const removeIncomingWebhookToken = async (
        incomingWebhookId: number,
        incomingWebhookTokenId: number,
    ) => {
        const requestId = 'removeIncomingWebhookToken';
        const req = createRequest(
            `${ENDPOINT}/${incomingWebhookId}/tokens/${incomingWebhookTokenId}`,
            { method: 'DELETE' },
            requestId,
        );

        await makeRequest(req.caller, req.id);
    };

    return {
        addIncomingWebhookToken,
        updateIncomingWebhookToken,
        removeIncomingWebhookToken,
        errors,
        loading,
    };
};
