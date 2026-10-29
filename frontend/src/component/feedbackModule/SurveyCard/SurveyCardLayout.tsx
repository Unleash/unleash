import { IconButton, Paper, styled } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export const StyledSurveyCard = styled(Paper)(({ theme }) => ({
    position: 'fixed',
    bottom: theme.spacing(3),
    right: theme.spacing(3),
    zIndex: theme.zIndex.tooltip,
    width: 360,
    maxWidth: `calc(100vw - ${theme.spacing(6)})`,
    maxHeight: `calc(100vh - ${theme.spacing(6)})`,
    overflowY: 'auto',
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadiusLarge,
}));

export const StyledSurveyCardHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: theme.spacing(2),
    marginTop: theme.spacing(-1),
    marginRight: theme.spacing(-1),
    marginBottom: theme.spacing(1),
}));

export const StyledSurveyCardActions = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1.5),
}));

interface SurveyCardCloseButtonProps {
    onClick: () => void;
    label?: string;
}

export const SurveyCardCloseButton = ({
    onClick,
    label = 'Close',
}: SurveyCardCloseButtonProps) => (
    <IconButton aria-label={label} size='small' onClick={onClick}>
        <CloseIcon fontSize='small' />
    </IconButton>
);
