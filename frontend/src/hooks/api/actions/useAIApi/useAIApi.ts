import useAPI from '../useApi/useApi';

const ENDPOINT = 'api/admin/ai';

export type ChatMessage = {
    role: 'system' | 'user' | 'assistant';
    content: string;
};

export const useAIApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const chat = async (messages: ChatMessage[]): Promise<ChatMessage[]> => {
        const requestId = 'chat';

        const req = createRequest(`${ENDPOINT}/chat`, {
            method: 'POST',
            body: JSON.stringify({
                messages,
            }),
            requestId,
        });

        const response = await makeRequest(req.caller, req.id);
        const { messages: newMessages } = await response.json();
        return newMessages;
    };

    return {
        chat,
        errors,
        loading,
    };
};
