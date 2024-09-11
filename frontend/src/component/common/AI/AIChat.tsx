import SmartToyIcon from '@mui/icons-material/SmartToy';
import CloseIcon from '@mui/icons-material/Close';
import {
    Avatar,
    IconButton,
    styled,
    TextField,
    Typography,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useAI } from 'hooks/api/actions/useAI/useAI';
import { Markdown } from '../Markdown/Markdown';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';

const StyledContainer = styled('div')(({ theme }) => ({
    position: 'fixed',
    bottom: 10,
    right: 10,
    zIndex: theme.zIndex.fab,
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
    background: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
        background: theme.palette.primary.dark,
    },
}));

const StyledChat = styled('div')(({ theme }) => ({
    border: `1px solid ${theme.palette.primary.border}`,
    borderRadius: theme.shape.borderRadius,
}));

const StyledHeader = styled('div')(({ theme }) => ({
    background: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(1, 2),
}));

const StyledChatContent = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2),
    background: theme.palette.background.paper,
    width: theme.spacing(40),
    height: theme.spacing(50),
    overflow: 'auto',
}));

const StyledMessageContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'flex-start',
    gap: theme.spacing(1),
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    '&:first-child': {
        marginTop: 0,
    },
    '&:last-child': {
        marginBottom: 0,
    },
}));

const StyledMessage = styled('div')(({ theme }) => ({
    background: theme.palette.secondary.light,
    color: theme.palette.secondary.contrastText,
    border: `1px solid ${theme.palette.secondary.border}`,
    padding: theme.spacing(0.75),
}));

const StyledAIMessage = styled(StyledMessage)(({ theme }) => ({
    background: theme.palette.secondary.light,
    color: theme.palette.secondary.contrastText,
    border: `1px solid ${theme.palette.secondary.border}`,
    borderRadius: theme.shape.borderRadius,
    display: 'inline-block',
    wordWrap: 'break-word',
}));

const StyledUserMessage = styled(StyledMessage)(({ theme }) => ({
    background: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    border: `1px solid ${theme.palette.primary.border}`,
    borderRadius: theme.shape.borderRadius,
    display: 'inline-block',
    wordWrap: 'break-word',
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
    width: theme.spacing(4),
    height: theme.spacing(4),
}));

const StyledForm = styled('form')(({ theme }) => ({
    background: theme.palette.background.paper,
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1),
}));

const StyledInput = styled(TextField)(({ theme }) => ({
    margin: theme.spacing(0.5),
}));

export const AIChat = () => {
    const { user } = useAuthUser();
    const [open, setOpen] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const { setToastApiError } = useToast();
    const { promptWithTools } = useAI();

    const [messages, setMessages] = useState<
        { role: 'system' | 'assistant' | 'user'; content: string }[]
    >([
        {
            role: 'system',
            content: `You are an assistant that helps users interact with Unleash. You should ask the user in case you're missing any required information. Unless I say otherwise, assume every flag belongs to the "default" project.`,
        },
    ]);

    const chatEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    if (!open) {
        return (
            <StyledContainer>
                <StyledIconButton onClick={() => setOpen(!open)}>
                    <SmartToyIcon />
                </StyledIconButton>
            </StyledContainer>
        );
    }

    const onSubmit = async (event: React.SyntheticEvent) => {
        event.preventDefault();

        try {
            setLoading(true);
            let tempMessages = [
                ...messages,
                { role: 'user' as const, content: prompt },
            ];
            setMessages(tempMessages);
            setPrompt('');
            const content = await promptWithTools(tempMessages);
            if (content) {
                tempMessages = [
                    ...tempMessages,
                    { role: 'assistant', content },
                ];
            }
            setMessages(tempMessages);
            setLoading(false);
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    return (
        <StyledContainer>
            <StyledChat>
                <StyledHeader>
                    <Typography fontSize={20} fontWeight='bold'>
                        Unleash AI
                    </Typography>
                    <IconButton onClick={() => setOpen(!open)}>
                        <CloseIcon />
                    </IconButton>
                </StyledHeader>
                <StyledChatContent>
                    <StyledMessageContainer>
                        <StyledAvatar
                            sx={(theme) => ({
                                backgroundColor: theme.palette.primary.main,
                            })}
                        >
                            <SmartToyIcon />
                        </StyledAvatar>
                        <StyledAIMessage>
                            <Markdown>Hello, how can I assist you?</Markdown>
                        </StyledAIMessage>
                    </StyledMessageContainer>
                    {messages.map(({ role, content }, index) => {
                        if (role === 'assistant') {
                            return (
                                <StyledMessageContainer>
                                    <StyledAvatar
                                        sx={(theme) => ({
                                            backgroundColor:
                                                theme.palette.primary.main,
                                        })}
                                    >
                                        <SmartToyIcon />
                                    </StyledAvatar>
                                    <StyledAIMessage key={index}>
                                        <Markdown>{content}</Markdown>
                                    </StyledAIMessage>
                                </StyledMessageContainer>
                            );
                        }

                        if (role === 'user') {
                            return (
                                <StyledMessageContainer
                                    sx={{ justifyContent: 'end' }}
                                >
                                    <StyledUserMessage key={index}>
                                        <Markdown>{content}</Markdown>
                                    </StyledUserMessage>
                                    <StyledAvatar src={user?.imageUrl} />
                                </StyledMessageContainer>
                            );
                        }
                    })}
                    {loading && (
                        <StyledMessageContainer>
                            <StyledAvatar
                                sx={(theme) => ({
                                    backgroundColor: theme.palette.primary.main,
                                })}
                            >
                                <SmartToyIcon />
                            </StyledAvatar>
                            <StyledAIMessage>
                                <Markdown>_Unleash AI is typing..._</Markdown>
                            </StyledAIMessage>
                        </StyledMessageContainer>
                    )}
                    <div ref={chatEndRef} />
                </StyledChatContent>
                <StyledForm onSubmit={onSubmit}>
                    <StyledInput
                        variant='outlined'
                        placeholder='Type a message'
                        fullWidth
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                    />
                </StyledForm>
            </StyledChat>
        </StyledContainer>
    );
};
