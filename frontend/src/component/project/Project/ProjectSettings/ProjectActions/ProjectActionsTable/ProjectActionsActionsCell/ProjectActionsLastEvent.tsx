import { IActionSet } from 'interfaces/action';
import { TooltipLink } from 'component/common/TooltipLink/TooltipLink';
import { useActionEvents } from 'hooks/api/getters/useActionEvents/useActionEvents';
import { ProjectActionsEventsDetails } from '../ProjectActionsEventsModal/ProjectActionsEventsDetails/ProjectActionsEventsDetails';
import { CircularProgress, styled } from '@mui/material';
import { CheckCircle, Error as ErrorIcon } from '@mui/icons-material';

const StyledTooltipLink = styled(TooltipLink)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
}));

export const StyledSuccessIcon = styled(CheckCircle)(({ theme }) => ({
    color: theme.palette.success.main,
}));

export const StyledFailedIcon = styled(ErrorIcon)(({ theme }) => ({
    color: theme.palette.error.main,
}));

interface IProjectActionsLastEventProps {
    action: IActionSet;
}

export const ProjectActionsLastEvent = ({
    action,
}: IProjectActionsLastEventProps) => {
    const { id, project } = action;
    const { actionEvents } = useActionEvents(id, project, 1, {
        refreshInterval: 5000,
    });

    if (actionEvents.length === 0) {
        return null;
    }

    const actionSetEvent = actionEvents[0];

    const icon =
        actionSetEvent.state === 'success' ? (
            <StyledSuccessIcon />
        ) : actionSetEvent.state === 'failed' ? (
            <StyledFailedIcon />
        ) : (
            <CircularProgress size={20} />
        );

    return (
        <StyledTooltipLink
            tooltipProps={{
                maxWidth: 500,
                maxHeight: 600,
            }}
            tooltip={<ProjectActionsEventsDetails {...actionSetEvent} />}
        >
            {icon}
        </StyledTooltipLink>
    );
};
