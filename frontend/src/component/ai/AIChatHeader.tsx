import { IconButton, styled, Tooltip, Typography } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import EditNoteIcon from '@mui/icons-material/EditNote';
import CloseIcon from '@mui/icons-material/Close';

const StyledHeader = styled('div')(({ theme }) => ({
    background: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(0.5),
}));

const StyledTitleContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginLeft: theme.spacing(1),
}));

const StyledTitle = styled(Typography)({
    fontWeight: 'bold',
});

const StyledActionsContainer = styled('div')({
    display: 'flex',
    alignItems: 'center',
});

const StyledIconButton = styled(IconButton)(({ theme }) => ({
    color: theme.palette.primary.contrastText,
}));

interface IAIChatHeaderProps {
    onNew: () => void;
    onClose: () => void;
}

export const AIChatHeader = ({ onNew, onClose }: IAIChatHeaderProps) => {
    return (
        <StyledHeader>
            <StyledTitleContainer>
                <SmartToyIcon />
                <StyledTitle>Unleash AI</StyledTitle>
            </StyledTitleContainer>
            <StyledActionsContainer>
                <Tooltip title='New chat' arrow>
                    <StyledIconButton size='small' onClick={onNew}>
                        <EditNoteIcon />
                    </StyledIconButton>
                </Tooltip>
                <Tooltip title='Close chat' arrow>
                    <StyledIconButton size='small' onClick={onClose}>
                        <CloseIcon />
                    </StyledIconButton>
                </Tooltip>
            </StyledActionsContainer>
        </StyledHeader>
    );
};
