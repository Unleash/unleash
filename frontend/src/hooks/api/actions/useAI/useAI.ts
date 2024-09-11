import { useState } from 'react';
import useAPI from '../useApi/useApi';
import { useUiFlag } from 'hooks/useUiFlag';

const ENDPOINT = 'api/admin/ai';

type ChatMessage = {
    role: 'system' | 'user' | 'assistant';
    content: string;
};

export const useAI = () => {
    const {
        makeStreamingRequest,
        makeRequest,
        createRequest,
        errors,
        loading,
    } = useAPI({
        propagateErrors: true,
    });

    const unleashAI = useUiFlag('unleashAI');

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [streamingComplete, setStreamingComplete] = useState(true);

    const prompt = async (content: string): Promise<string | undefined> => {
        if (!unleashAI) return;

        const requestId = 'prompt';

        setMessages((prevMessages) => [
            ...prevMessages,
            { role: 'user', content },
        ]);

        const req = createRequest(ENDPOINT, {
            method: 'POST',
            body: JSON.stringify({
                messages: [...messages, { role: 'user', content }],
            }),
            requestId,
        });

        const res = await makeRequest(req.caller, req.id);
        const { response } = await res.json();
        return response;
    };

    const promptWithTools = async (
        messages: ChatMessage[],
    ): Promise<string | undefined> => {
        if (!unleashAI) return;

        const requestId = 'promptWithTools';

        const req = createRequest(`${ENDPOINT}`, {
            method: 'POST',
            body: JSON.stringify({
                messages,
            }),
            requestId,
        });

        const res = await makeRequest(req.caller, req.id);
        const { response } = await res.json();
        return response;
    };

    const promptStream = async (content: string) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { role: 'user', content },
        ]);

        const req = createRequest(`${ENDPOINT}/stream`, {
            method: 'POST',
            body: JSON.stringify({
                messages: [...messages, { role: 'user', content }],
            }),
        });

        setStreamingComplete(false);

        await makeStreamingRequest(
            req.caller,
            (chunk: string) => {
                setMessages((prevMessages) => {
                    const lastMessage = prevMessages[prevMessages.length - 1];

                    if (lastMessage && lastMessage.role === 'assistant') {
                        return [
                            ...prevMessages.slice(0, -1),
                            {
                                role: 'assistant',
                                content: lastMessage.content + chunk,
                            },
                        ];
                    } else {
                        return [
                            ...prevMessages,
                            { role: 'assistant', content: chunk },
                        ];
                    }
                });
            },
            'prompt',
        );

        setStreamingComplete(true);
    };

    return {
        prompt,
        promptWithTools,
        promptStream,
        messages,
        errors,
        loading,
        streamingComplete,
    };
};
