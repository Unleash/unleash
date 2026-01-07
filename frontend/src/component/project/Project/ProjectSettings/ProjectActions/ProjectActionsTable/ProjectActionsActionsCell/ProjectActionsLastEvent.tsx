import type { IActionSet } from 'interfaces/action';
import { TooltipLink } from 'component/common/TooltipLink/TooltipLink';
import { useActionEvents } from 'hooks/api/getters/useActionEvents/useActionEvents';
import { ProjectActionsEventsDetails } from '../ProjectActionsEventsModal/ProjectActionsEventsDetails/ProjectActionsEventsDetails.tsx';
import { CircularProgress, styled } from '@mui/material';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { formatDateYMDHMS } from 'utils/formatDate';

const StyledTooltipLink = styled(TooltipLink)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
}));

const StyledTitle = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: theme.spacing(0, 2),
    marginTop: theme.spacing(2),
}));

const StyledLastEventSpan = styled('span')(({ theme }) => ({
    fontSize: theme.fontSizes.bodySize,
}));

export const StyledSuccessIcon = styled(CheckCircleOutline)(({ theme }) => ({
    color: theme.palette.success.main,
}));

export const StyledFailedIcon = styled(ErrorOutline)(({ theme }) => ({
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
    const { locationSettings } = useLocationSettings();

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
            tooltip={
                <>
                    <StyledTitle>
                        <StyledLastEventSpan>Last event</StyledLastEventSpan>
                        <span>
                            {formatDateYMDHMS(
                                actionSetEvent.createdAt,
                                locationSettings?.locale,
                            )}
                        </span>
                    </StyledTitle>
                    <ProjectActionsEventsDetails {...actionSetEvent} />
                </>
            }
        >
            {icon}
        </StyledTooltipLink>
    );
};
