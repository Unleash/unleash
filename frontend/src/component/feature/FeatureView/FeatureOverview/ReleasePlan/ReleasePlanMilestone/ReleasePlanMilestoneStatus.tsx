import { styled } from '@mui/material';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import TripOriginIcon from '@mui/icons-material/TripOrigin';

export type MilestoneStatus = 'not-started' | 'active' | 'paused' | 'completed';

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
            status === 'active' ? theme.palette.success.light : 'transparent',
        '&:focus-visible': {
            outline: `2px solid ${theme.palette.primary.main}`,
        },
        '&:hover': {
            backgroundColor:
                status === 'active'
                    ? theme.palette.success.light
                    : status === 'paused'
                      ? 'transparent'
                      : theme.palette.neutral.light,
            textDecoration: 'none',
        },
        fontSize: theme.fontSizes.smallerBody,
        lineHeight: theme.fontSizes.smallerBody,
        fontWeight: theme.fontWeight.medium,
        borderRadius: theme.shape.borderRadiusMedium,
        color:
            status === 'active'
                ? theme.palette.success.contrastText
                : status === 'paused'
                  ? theme.palette.text.primary
                  : theme.palette.primary.main,
        textDecoration:
            status === 'not-started' || status === 'completed'
                ? 'underline'
                : 'none',
        '& svg': {
            color:
                status === 'active'
                    ? theme.palette.success.main
                    : status === 'paused'
                      ? theme.palette.text.disabled
                      : status === 'completed'
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

    const statusIcon =
        status === 'active' ? (
            <TripOriginIcon />
        ) : status === 'paused' ? (
            <PauseCircleIcon />
        ) : (
            <PlayCircleIcon />
        );

    const disabled = status === 'active' || status === 'paused';

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
