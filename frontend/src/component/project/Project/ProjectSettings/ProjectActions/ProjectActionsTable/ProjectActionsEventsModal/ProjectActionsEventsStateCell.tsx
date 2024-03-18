import { CircularProgress, styled } from '@mui/material';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import type { IActionSetEvent } from 'interfaces/action';

export const StyledSuccessIcon = styled(CheckCircleOutline)(({ theme }) => ({
    color: theme.palette.success.main,
}));

export const StyledFailedIcon = styled(ErrorOutline)(({ theme }) => ({
    color: theme.palette.error.main,
}));

export const ProjectActionsEventsStateCell = ({ state }: IActionSetEvent) => {
    if (state === 'success') {
        return <StyledSuccessIcon />;
    }

    if (state === 'failed') {
        return <StyledFailedIcon />;
    }

    return <CircularProgress size={20} />;
};
