import { styled } from '@mui/material';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import TripOriginIcon from '@mui/icons-material/TripOrigin';
import { useUiFlag } from 'hooks/useUiFlag';
import { useHasProjectEnvironmentAccess } from 'hooks/useHasAccess';
import { UPDATE_FEATURE_STRATEGY } from 'component/providers/AccessProvider/permissions';
import { TooltipResolver } from 'component/common/TooltipResolver/TooltipResolver';
import { formatAccessText } from 'utils/formatAccessText';

export type MilestoneProgressionStatus = 'paused' | 'active';

export type MilestoneStatus =
    | {
          type: 'not-started';
          scheduledAt?: Date;
          progression: MilestoneProgressionStatus;
      }
    | { type: 'active'; progression: MilestoneProgressionStatus }
    | { type: 'paused'; progression: MilestoneProgressionStatus }
    | { type: 'completed'; progression: MilestoneProgressionStatus };

const BaseStatusButton = styled('button')<{ disabled?: boolean }>(
    ({ theme, disabled }) => ({
        display: 'flex',
        alignItems: 'center',
        border: 'none',
        gap: theme.spacing(1),
        padding: 0,
        paddingRight: theme.spacing(1),
        cursor: disabled ? 'default' : 'pointer',
        fontSize: theme.fontSizes.smallerBody,
        lineHeight: theme.fontSizes.smallerBody,
        fontWeight: theme.fontWeight.medium,
        borderRadius: theme.shape.borderRadiusMedium,
        textDecoration: 'none',
        '&:focus-visible': {
            outline: `2px solid ${theme.palette.primary.main}`,
        },
        '& svg': {
            height: theme.spacing(3),
            width: theme.spacing(3),
        },
    }),
);

const ActiveStatusButton = styled(BaseStatusButton)(({ theme }) => ({
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.contrastText,
    '&:hover': {
        backgroundColor: theme.palette.success.light,
        textDecoration: 'none',
    },
    '& svg': {
        color: theme.palette.success.main,
    },
}));

const PausedStatusButton = styled(BaseStatusButton)(({ theme }) => ({
    backgroundColor: theme.palette.neutral.light,
    color: theme.palette.text.primary,
    '&:hover': {
        backgroundColor: 'transparent',
        textDecoration: 'none',
    },
    '& svg': {
        color: theme.palette.text.disabled,
    },
}));

const ScheduledStatusButton = styled(BaseStatusButton)(({ theme }) => ({
    backgroundColor: 'transparent',
    color: theme.palette.primary.main,
    textDecoration: 'underline',
    '&:hover': {
        backgroundColor: 'transparent',
        textDecoration: 'none',
    },
    '& svg': {
        color: theme.palette.primary.main,
    },
}));

const DefaultStatusButton = styled(BaseStatusButton)(({ theme }) => ({
    backgroundColor: theme.palette.neutral.light,
    color: theme.palette.primary.main,
    '&:hover': {
        backgroundColor: theme.palette.neutral.light,
        textDecoration: 'none',
    },
    '& svg': {
        color: theme.palette.primary.main,
    },
}));

const CompletedStatusButton = styled(BaseStatusButton)(({ theme }) => ({
    backgroundColor: theme.palette.neutral.light,
    color: theme.palette.primary.main,
    '&:hover': {
        backgroundColor: theme.palette.neutral.light,
        textDecoration: 'none',
    },
    '& svg': {
        color: theme.palette.neutral.border,
    },
}));

interface IReleasePlanMilestoneStatusProps {
    status: MilestoneStatus;
    onStartMilestone: () => void;
    projectId?: string;
    environmentId?: string;
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

const getStatusButton = (
    status: MilestoneStatus,
    progressionsEnabled: boolean,
) => {
    if (status.type === 'active') return ActiveStatusButton;
    if (status.type === 'paused') return PausedStatusButton;
    if (
        progressionsEnabled &&
        status.type === 'not-started' &&
        status.scheduledAt
    ) {
        return ScheduledStatusButton;
    }
    if (status.type === 'completed') return CompletedStatusButton;
    return DefaultStatusButton;
};

export const ReleasePlanMilestoneStatus = ({
    status,
    onStartMilestone,
    projectId,
    environmentId,
}: IReleasePlanMilestoneStatusProps) => {
    const milestoneProgressionsEnabled = useUiFlag('milestoneProgression');
    const hasAccess =
        projectId && environmentId
            ? useHasProjectEnvironmentAccess(
                  UPDATE_FEATURE_STRATEGY,
                  projectId,
                  environmentId,
              )
            : true;

    const StatusButton = getStatusButton(status, milestoneProgressionsEnabled);
    const statusText = getStatusText(status, milestoneProgressionsEnabled);
    const statusIcon = getStatusIcon(status);
    const isActionable =
        status.type === 'not-started' || status.type === 'completed';
    const disabled = !isActionable || !hasAccess;
    const isScheduled =
        milestoneProgressionsEnabled &&
        status.type === 'not-started' &&
        status.scheduledAt;

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!disabled) {
            onStartMilestone();
        }
    };

    const button = (
        <StatusButton onClick={handleClick} disabled={disabled}>
            {!isScheduled && statusIcon}
            {statusText}
        </StatusButton>
    );

    if (isActionable && !hasAccess) {
        return (
            <TooltipResolver title={formatAccessText(false)} arrow>
                {button}
            </TooltipResolver>
        );
    } else {
        return button;
    }
};
