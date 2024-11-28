import { Link, styled } from '@mui/material';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import TripOriginIcon from '@mui/icons-material/TripOrigin';

export type MilestoneStatus = 'not-started' | 'active' | 'paused' | 'completed';

const StyledStatus = styled('div', {
    shouldForwardProp: (prop) => prop !== 'status',
})<{ status: MilestoneStatus }>(({ theme, status }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    paddingRight: theme.spacing(1),
    fontSize: theme.fontSizes.smallerBody,
    borderRadius: theme.shape.borderRadiusMedium,
    backgroundColor:
        status === 'active' ? theme.palette.success.light : 'transparent',
    color:
        status === 'active'
            ? theme.palette.success.contrastText
            : status === 'completed'
              ? theme.palette.text.secondary
              : theme.palette.text.primary,
    '& svg': {
        color:
            status === 'active'
                ? theme.palette.success.main
                : status === 'paused'
                  ? theme.palette.text.disabled
                  : status === 'completed'
                    ? theme.palette.neutral.border
                    : theme.palette.primary.main,
    },
}));

interface IReleasePlanMilestoneStatusProps {
    status: MilestoneStatus;
    onStartMilestone: () => void;
}

export const ReleasePlanMilestoneStatus = ({
    status,
    onStartMilestone,
}: IReleasePlanMilestoneStatusProps) => {
    const statusText =
        status === 'active'
            ? 'Running'
            : status === 'paused'
              ? 'Paused (disabled in environment)'
              : status === 'completed'
                ? 'Restart'
                : 'Start';

    return (
        <StyledStatus status={status}>
            {status === 'active' ? (
                <TripOriginIcon />
            ) : status === 'paused' ? (
                <PauseCircleIcon />
            ) : (
                <PlayCircleIcon />
            )}
            {status === 'not-started' || status === 'completed' ? (
                <Link
                    onClick={(e) => {
                        e.stopPropagation();
                        onStartMilestone();
                    }}
                >
                    {statusText}
                </Link>
            ) : (
                <span>{statusText}</span>
            )}
        </StyledStatus>
    );
};
