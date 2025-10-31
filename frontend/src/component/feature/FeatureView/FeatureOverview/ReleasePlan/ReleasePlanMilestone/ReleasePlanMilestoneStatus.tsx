import { styled } from '@mui/material';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import TripOriginIcon from '@mui/icons-material/TripOrigin';
import { useUiFlag } from 'hooks/useUiFlag';

export type MilestoneStatus =
    | { type: 'not-started'; scheduledAt?: Date }
    | { type: 'active' }
    | { type: 'paused' }
    | { type: 'completed' };

const StyledStatusButton = styled('button', {
    shouldForwardProp: (prop) => prop !== 'status',
})<{ status: MilestoneStatus; disabled?: boolean }>(
    ({ theme, status, disabled }) => ({
        display: 'flex',
        alignItems: 'center',
        border: 'none',
        gap: theme.spacing(1),
        padding: 0,
        paddingRight: theme.spacing(1),
        cursor: 'pointer',
        backgroundColor:
            status.type === 'active'
                ? theme.palette.success.light
                : theme.palette.neutral.light,
        '&:focus-visible': {
            outline: `2px solid ${theme.palette.primary.main}`,
        },
        '&:hover': {
            backgroundColor:
                status.type === 'active'
                    ? theme.palette.success.light
                    : status.type === 'paused'
                      ? 'transparent'
                      : theme.palette.neutral.light,
            textDecoration: 'none',
        },
        fontSize: theme.fontSizes.smallerBody,
        lineHeight: theme.fontSizes.smallerBody,
        fontWeight: theme.fontWeight.medium,
        borderRadius: theme.shape.borderRadiusMedium,
        color:
            status.type === 'active'
                ? theme.palette.success.contrastText
                : status.type === 'paused'
                  ? theme.palette.text.primary
                  : theme.palette.primary.main,
        '& svg': {
            color:
                status.type === 'active'
                    ? theme.palette.success.main
                    : status.type === 'paused'
                      ? theme.palette.text.disabled
                      : status.type === 'completed'
                        ? theme.palette.neutral.border
                        : theme.palette.primary.main,
            height: theme.spacing(3),
            width: theme.spacing(3),
        },
        ...(disabled && {
            pointerEvents: 'none',
        }),
    }),
);

interface IReleasePlanMilestoneStatusProps {
    status: MilestoneStatus;
    onStartMilestone: () => void;
}

const getStatusText = (
    status: MilestoneStatus,
    progressionsEnabled: boolean,
): string => {
    switch (status.type) {
        case 'active':
            return 'Running';
        case 'paused':
            return 'Paused (disabled in environment)';
        case 'completed':
            return progressionsEnabled ? 'Start now' : 'Restart';
        case 'not-started':
            return progressionsEnabled ? 'Start now' : 'Start';
    }
};

const getStatusIcon = (status: MilestoneStatus) => {
    switch (status.type) {
        case 'active':
            return <TripOriginIcon />;
        case 'paused':
            return <PauseCircleIcon />;
        default:
            return <PlayCircleIcon />;
    }
};

export const ReleasePlanMilestoneStatus = ({
    status,
    onStartMilestone,
}: IReleasePlanMilestoneStatusProps) => {
    const milestoneProgressionsEnabled = useUiFlag('milestoneProgression');

    const statusText = getStatusText(status, milestoneProgressionsEnabled);
    const statusIcon = getStatusIcon(status);
    const disabled = status.type === 'active' || status.type === 'paused';

    return (
        <StyledStatusButton
            status={status}
            onClick={(e) => {
                e.stopPropagation();
                onStartMilestone();
            }}
            disabled={disabled}
        >
            {statusIcon}
            {statusText}
        </StyledStatusButton>
    );
};
