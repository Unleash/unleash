import { useState } from 'react';
import useAPI from '../useApi/useApi';

const ENDPOINT = 'api/admin/ai';

export type ChatMessage = {
    role: 'system' | 'user' | 'assistant';
    content: string;
};

type Chat = {
    id: string;
    userId: number;
    createdAt: string;
    messages: ChatMessage[];
};

export const useAIApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const [chatId, setChatId] = useState<string>();

    const chat = async (message: string): Promise<Chat> => {
        const requestId = 'chat';

        const req = createRequest(
            `${ENDPOINT}/chat${chatId ? `/${chatId}` : ''}`,
            {
                method: 'POST',
                body: JSON.stringify({
                    message,
                }),
                requestId,
            },
        );

        const response = await makeRequest(req.caller, req.id);
        const chat: Chat = await response.json();
        setChatId(chat.id);
        return chat;
    };

    const newChat = () => {
        setChatId(undefined);
    };

    return {
        chat,
        newChat,
        errors,
        loading,
    };
};
