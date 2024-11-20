import { useEffect, useRef, useState } from 'react';
import {
    IconButton,
    InputAdornment,
    styled,
    TextField,
    Tooltip,
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

const StyledAIChatInputContainer = styled('div')(({ theme }) => ({
    background: theme.palette.background.paper,
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1),
    paddingTop: 0,
}));

const StyledAIChatInput = styled(TextField)(({ theme }) => ({
    margin: theme.spacing(1),
    marginTop: 0,
}));

const StyledInputAdornment = styled(InputAdornment)({
    marginLeft: 0,
});

const StyledIconButton = styled(IconButton)({
    padding: 0,
});

export interface IAIChatInputProps {
    onSend: (message: string) => void;
    loading: boolean;
    onHeightChange?: () => void;
}

export const AIChatInput = ({
    onSend,
    loading,
    onHeightChange,
}: IAIChatInputProps) => {
    const [message, setMessage] = useState('');

    const inputContainerRef = useRef<HTMLDivElement | null>(null);
    const previousHeightRef = useRef<number>(0);

    useEffect(() => {
        const resizeObserver = new ResizeObserver(([entry]) => {
            const newHeight = entry.contentRect.height;

            if (newHeight !== previousHeightRef.current) {
                previousHeightRef.current = newHeight;
                onHeightChange?.();
            }
        });

        if (inputContainerRef.current) {
            resizeObserver.observe(inputContainerRef.current);
        }

        return () => {
            if (inputContainerRef.current) {
                resizeObserver.unobserve(inputContainerRef.current);
            }
        };
    }, [onHeightChange]);

    const send = () => {
        if (!message.trim() || loading) return;
        onSend(message);
        setMessage('');
    };

    return (
        <StyledAIChatInputContainer ref={inputContainerRef}>
            <StyledAIChatInput
                autoFocus
                size='small'
                variant='outlined'
                placeholder='Type your message here'
                fullWidth
                multiline
                maxRows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        send();
                    }
                }}
                InputProps={{
                    sx: { paddingRight: 1 },
                    endAdornment: (
                        <StyledInputAdornment position='end'>
                            <Tooltip title='Send message' arrow>
                                <div>
                                    <StyledIconButton
                                        onClick={send}
                                        size='small'
                                        color='primary'
                                        disabled={!message.trim() || loading}
                                    >
                                        <ArrowUpwardIcon />
                                    </StyledIconButton>
                                </div>
                            </Tooltip>
                        </StyledInputAdornment>
                    ),
                }}
            />
        </StyledAIChatInputContainer>
    );
};
