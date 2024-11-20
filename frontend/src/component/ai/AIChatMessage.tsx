import { Avatar, styled } from '@mui/material';
import { ReactComponent as AIIcon } from 'assets/icons/AI.svg';
import { Markdown } from 'component/common/Markdown/Markdown';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import type { ChatMessage } from 'hooks/api/actions/useAIApi/useAIApi';

const StyledMessageContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'flex-start',
    gap: theme.spacing(1),
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    '&:first-of-type': {
        marginTop: 0,
    },
    '&:last-of-type': {
        marginBottom: 0,
    },
    wordBreak: 'break-word',
}));

const StyledUserMessageContainer = styled(StyledMessageContainer)({
    justifyContent: 'end',
});

const StyledAIMessage = styled('div')(({ theme }) => ({
    background: theme.palette.secondary.light,
    color: theme.palette.secondary.contrastText,
    border: `1px solid ${theme.palette.secondary.border}`,
    borderRadius: theme.shape.borderRadius,
    display: 'inline-block',
    wordWrap: 'break-word',
    padding: theme.spacing(0.75),
    position: 'relative',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: '12px',
        left: '-10px',
        width: '0',
        height: '0',
        borderStyle: 'solid',
        borderWidth: '5px',
        borderColor: `transparent ${theme.palette.secondary.border} transparent transparent`,
    },
    pre: {
        whiteSpace: 'pre-wrap',
    },
}));

const StyledUserMessage = styled(StyledAIMessage)(({ theme }) => ({
    background: theme.palette.neutral.light,
    color: theme.palette.neutral.contrastText,
    borderColor: theme.palette.neutral.border,
    '&::before': {
        left: 'auto',
        right: '-10px',
        borderColor: `transparent transparent transparent ${theme.palette.neutral.border}`,
    },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
    width: theme.spacing(4.5),
    height: theme.spacing(4.5),
    backgroundColor:
        theme.mode === 'light'
            ? theme.palette.primary.main
            : theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
}));

interface IAIChatMessageProps {
    from: ChatMessage['role'];
    children: string;
}

export const AIChatMessage = ({ from, children }: IAIChatMessageProps) => {
    const { user } = useAuthUser();

    if (from === 'user') {
        return (
            <StyledUserMessageContainer>
                <StyledUserMessage>
                    <Markdown>{children}</Markdown>
                </StyledUserMessage>
                <StyledAvatar src={user?.imageUrl} />
            </StyledUserMessageContainer>
        );
    }

    if (from === 'assistant') {
        return (
            <StyledMessageContainer>
                <StyledAvatar>
                    <AIIcon />
                </StyledAvatar>
                <StyledAIMessage>
                    <Markdown>{children}</Markdown>
                </StyledAIMessage>
            </StyledMessageContainer>
        );
    }
};
