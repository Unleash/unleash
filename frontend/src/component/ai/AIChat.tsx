import { mutate } from 'swr';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { IconButton, styled } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import {
    type ChatMessage,
    useAIApi,
} from 'hooks/api/actions/useAIApi/useAIApi';
import { useUiFlag } from 'hooks/useUiFlag';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { AIChatInput } from './AIChatInput';
import { AIChatMessage } from './AIChatMessage';
import { AIChatHeader } from './AIChatHeader';
import { Resizable } from 'component/common/Resizable/Resizable';

const StyledAIIconContainer = styled('div')(({ theme }) => ({
    position: 'fixed',
    bottom: 20,
    right: 20,
    zIndex: theme.zIndex.fab,
    animation: 'fadeInBottom 0.5s',
    '@keyframes fadeInBottom': {
        from: {
            opacity: 0,
            transform: 'translateY(200px)',
        },
        to: {
            opacity: 1,
            transform: 'translateY(0)',
        },
    },
}));

const StyledAIChatContainer = styled(StyledAIIconContainer)({
    bottom: 10,
    right: 10,
});

const StyledResizable = styled(Resizable)(({ theme }) => ({
    boxShadow: theme.boxShadows.popup,
    borderRadius: theme.shape.borderRadiusLarge,
}));

const StyledAIIconButton = styled(IconButton)(({ theme }) => ({
    background: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    boxShadow: theme.boxShadows.popup,
    '&:hover': {
        background: theme.palette.primary.dark,
    },
}));

const StyledChat = styled('div')(({ theme }) => ({
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    overflow: 'hidden',
    background: theme.palette.background.paper,
}));

const StyledChatContent = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2),
    paddingBottom: theme.spacing(1),
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
}));

const initialMessages: ChatMessage[] = [
    {
        role: 'system',
        content: `You are an assistant that helps users interact with Unleash. You should ask the user in case you're missing any required information.`,
    },
];

export const AIChat = () => {
    const unleashAIEnabled = useUiFlag('unleashAI');
    const {
        uiConfig: { unleashAIAvailable },
    } = useUiConfig();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { setToastApiError } = useToast();
    const { chat } = useAIApi();

    const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

    const chatEndRef = useRef<HTMLDivElement | null>(null);

    const scrollToEnd = (options?: ScrollIntoViewOptions) => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView(options);
        }
    };

    useEffect(() => {
        scrollToEnd({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        scrollToEnd();
    }, [open]);

    const onSend = async (message: string) => {
        if (!message.trim() || loading) return;

        try {
            setLoading(true);
            const tempMessages: ChatMessage[] = [
                ...messages,
                { role: 'user', content: message },
                { role: 'assistant', content: '_Unleash AI is typing..._' },
            ];
            setMessages(tempMessages);
            const newMessages = await chat(tempMessages.slice(0, -1));
            mutate(() => true);
            setMessages(newMessages);
            setLoading(false);
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    if (!unleashAIEnabled || !unleashAIAvailable) {
        return null;
    }

    if (!open) {
        return (
            <StyledAIIconContainer>
                <StyledAIIconButton size='large' onClick={() => setOpen(true)}>
                    <SmartToyIcon />
                </StyledAIIconButton>
            </StyledAIIconContainer>
        );
    }

    return (
        <StyledAIChatContainer>
            <StyledResizable
                handlers={['top-left', 'top', 'left']}
                minSize={{ width: '270px', height: '200px' }}
                maxSize={{ width: '90vw', height: '90vh' }}
                defaultSize={{ width: '25vw', height: '60vh' }}
                onResize={scrollToEnd}
            >
                <StyledChat>
                    <AIChatHeader
                        onNew={() => setMessages(initialMessages)}
                        onClose={() => setOpen(false)}
                    />
                    <StyledChatContent>
                        <AIChatMessage from='assistant'>
                            Hello, how can I assist you?
                        </AIChatMessage>
                        {messages.map(({ role, content }, index) => (
                            <AIChatMessage key={index} from={role}>
                                {content}
                            </AIChatMessage>
                        ))}
                        <div ref={chatEndRef} />
                    </StyledChatContent>
                    <AIChatInput onSend={onSend} loading={loading} />
                </StyledChat>
            </StyledResizable>
        </StyledAIChatContainer>
    );
};
