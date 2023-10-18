import { IMessageBanner } from 'interfaces/messageBanner';
import useAPI from '../useApi/useApi';

const ENDPOINT = 'api/admin/message-banners';

export const useMessageBannersApi = () => {
    const { loading, makeRequest, createRequest, errors } = useAPI({
        propagateErrors: true,
    });

    const addMessageBanner = async (messageBanner: IMessageBanner) => {
        const requestId = 'addMessageBanner';
        const req = createRequest(
            ENDPOINT,
            {
                method: 'POST',
                body: JSON.stringify(messageBanner),
            },
            requestId,
        );

        const response = await makeRequest(req.caller, req.id);
        return response.json();
    };

    const updateMessageBanner = async (
        messageBannerId: number,
        messageBanner: IMessageBanner,
    ) => {
        const requestId = 'updateMessageBanner';
        const req = createRequest(
            `${ENDPOINT}/${messageBannerId}`,
            {
                method: 'PUT',
                body: JSON.stringify(messageBanner),
            },
            requestId,
        );

        await makeRequest(req.caller, req.id);
    };

    const removeMessageBanner = async (messageBannerId: number) => {
        const requestId = 'removeMessageBanner';
        const req = createRequest(
            `${ENDPOINT}/${messageBannerId}`,
            { method: 'DELETE' },
            requestId,
        );

        await makeRequest(req.caller, req.id);
    };

    return {
        addMessageBanner,
        updateMessageBanner,
        removeMessageBanner,
        errors,
        loading,
    };
};
