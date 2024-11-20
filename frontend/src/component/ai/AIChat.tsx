import { mutate } from 'swr';
import { ReactComponent as AIIcon } from 'assets/icons/AI.svg';
import { IconButton, styled, Tooltip, useMediaQuery } from '@mui/material';
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
import { AIChatDisclaimer } from './AIChatDisclaimer';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import theme from 'themes/theme';
import { Highlight } from 'component/common/Highlight/Highlight';

const AI_ERROR_MESSAGE = {
    role: 'assistant',
    content: `I'm sorry, I'm having trouble understanding you right now. I've reported the issue to the team. Please try again later.`,
} as const;

type ScrollOptions = ScrollIntoViewOptions & {
    onlyIfAtEnd?: boolean;
};

const StyledAIIconContainer = styled('div', {
    shouldForwardProp: (prop) => prop !== 'demoStepsVisible',
})<{ demoStepsVisible: boolean }>(({ theme, demoStepsVisible }) => ({
    position: 'fixed',
    bottom: 20,
    right: 20,
    ...(demoStepsVisible && {
        right: 260,
    }),
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

const StyledAIChatContainer = styled(StyledAIIconContainer, {
    shouldForwardProp: (prop) => prop !== 'demoStepsVisible',
})<{ demoStepsVisible: boolean }>(({ demoStepsVisible }) => ({
    bottom: 10,
    right: 10,
    ...(demoStepsVisible && {
        right: 250,
    }),
}));

const StyledResizable = styled(Resizable)(({ theme }) => ({
    boxShadow: theme.boxShadows.popup,
    borderRadius: theme.shape.borderRadiusLarge,
}));

const StyledAIIconButton = styled(IconButton)(({ theme }) => ({
    background:
        theme.mode === 'light'
            ? theme.palette.primary.main
            : theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    boxShadow: theme.boxShadows.popup,
    transition: 'background 0.3s',
    '&:hover': {
        background: theme.palette.primary.dark,
    },
    '& > svg': {
        width: theme.spacing(3),
        height: theme.spacing(3),
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

export const AIChat = () => {
    const unleashAIEnabled = useUiFlag('unleashAI');
    const demoEnabled = useUiFlag('demo');
    const isSmallScreen = useMediaQuery(theme.breakpoints.down(768));
    const {
        uiConfig: { unleashAIAvailable },
    } = useUiConfig();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { setToastApiError } = useToast();
    const { chat, newChat } = useAIApi();
    const { trackEvent } = usePlausibleTracker();

    const [messages, setMessages] = useState<ChatMessage[]>([]);

    const isAtEndRef = useRef(true);
    const chatEndRef = useRef<HTMLDivElement | null>(null);

    const scrollToEnd = (options?: ScrollOptions) => {
        if (chatEndRef.current) {
            const shouldScroll = !options?.onlyIfAtEnd || isAtEndRef.current;

            if (shouldScroll) {
                chatEndRef.current.scrollIntoView(options);
            }
        }
    };

    useEffect(() => {
        requestAnimationFrame(() => {
            scrollToEnd();
        });

        const intersectionObserver = new IntersectionObserver(
            ([entry]) => {
                isAtEndRef.current = entry.isIntersecting;
            },
            { threshold: 1.0 },
        );

        if (chatEndRef.current) {
            intersectionObserver.observe(chatEndRef.current);
        }

        return () => {
            if (chatEndRef.current) {
                intersectionObserver.unobserve(chatEndRef.current);
            }
        };
    }, [open]);

    useEffect(() => {
        scrollToEnd({ behavior: 'smooth', onlyIfAtEnd: true });
    }, [messages]);

    const onSend = async (content: string) => {
        if (!content.trim() || loading) return;

        trackEvent('unleash-ai-chat', {
            props: {
                eventType: 'send',
            },
        });

        try {
            setLoading(true);
            setMessages((currentMessages) => [
                ...currentMessages,
                { role: 'user', content },
            ]);
            const { messages: newMessages } = await chat(content);
            mutate(() => true);
            setMessages(newMessages);
        } catch (error: unknown) {
            setMessages((currentMessages) => [
                ...currentMessages,
                AI_ERROR_MESSAGE,
            ]);
            setToastApiError(formatUnknownError(error));
        } finally {
            setLoading(false);
        }
    };

    const onNewChat = () => {
        setMessages([]);
        newChat();
    };

    const demoStepsVisible = demoEnabled && !isSmallScreen;

    if (!unleashAIEnabled || !unleashAIAvailable) {
        return null;
    }

    if (!open) {
        return (
            <StyledAIIconContainer demoStepsVisible={demoStepsVisible}>
                <Tooltip arrow title='Unleash AI'>
                    <Highlight highlightKey='unleashAI'>
                        <StyledAIIconButton
                            size='large'
                            onClick={() => {
                                trackEvent('unleash-ai-chat', {
                                    props: {
                                        eventType: 'open',
                                    },
                                });
                                setOpen(true);
                            }}
                        >
                            <AIIcon />
                        </StyledAIIconButton>
                    </Highlight>
                </Tooltip>
            </StyledAIIconContainer>
        );
    }

    return (
        <StyledAIChatContainer demoStepsVisible={demoStepsVisible}>
            <Highlight highlightKey='unleashAI'>
                <StyledResizable
                    handlers={['top-left', 'top', 'left']}
                    minSize={{ width: '270px', height: '250px' }}
                    maxSize={{ width: '80vw', height: '90vh' }}
                    defaultSize={{ width: '320px', height: '500px' }}
                    onResize={() => scrollToEnd({ onlyIfAtEnd: true })}
                >
                    <StyledChat>
                        <AIChatHeader
                            onNew={onNewChat}
                            onClose={() => {
                                trackEvent('unleash-ai-chat', {
                                    props: {
                                        eventType: 'close',
                                    },
                                });
                                setOpen(false);
                            }}
                        />
                        <StyledChatContent>
                            <AIChatDisclaimer />
                            <AIChatMessage from='assistant'>
                                Hello, how can I assist you?
                            </AIChatMessage>
                            {messages.map(({ role, content }, index) => (
                                <AIChatMessage key={index} from={role}>
                                    {content}
                                </AIChatMessage>
                            ))}
                            {loading && (
                                <AIChatMessage from='assistant'>
                                    _Unleash AI is typing..._
                                </AIChatMessage>
                            )}
                            <div ref={chatEndRef} />
                        </StyledChatContent>
                        <AIChatInput
                            onSend={onSend}
                            loading={loading}
                            onHeightChange={() =>
                                scrollToEnd({ onlyIfAtEnd: true })
                            }
                        />
                    </StyledChat>
                </StyledResizable>
            </Highlight>
        </StyledAIChatContainer>
    );
};
