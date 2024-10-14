import { useState } from 'react';
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
}));

const StyledAIChatInput = styled(TextField)(({ theme }) => ({
    margin: theme.spacing(0.5),
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
}

export const AIChatInput = ({ onSend, loading }: IAIChatInputProps) => {
    const [message, setMessage] = useState('');

    const send = () => {
        if (!message.trim() || loading) return;
        onSend(message);
        setMessage('');
    };

    return (
        <StyledAIChatInputContainer>
            <StyledAIChatInput
                autoFocus
                size='small'
                variant='outlined'
                placeholder='Type your message here'
                fullWidth
                multiline
                maxRows={20}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
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
