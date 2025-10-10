import BoltIcon from '@mui/icons-material/Bolt';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { IconButton, styled } from '@mui/material';
import { formatDuration, intervalToDuration } from 'date-fns';
import type { MilestoneStatus } from './ReleasePlanMilestoneStatus.tsx';

const StyledDisplayContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    justifyContent: 'space-between',
    width: '100%',
}));

const StyledContentGroup = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const StyledIcon = styled(BoltIcon, {
    shouldForwardProp: (prop) => prop !== 'status',
})<{ status?: MilestoneStatus }>(({ theme, status }) => ({
    color: theme.palette.common.white,
    fontSize: 18,
    flexShrink: 0,
    backgroundColor: status === 'completed' ? theme.palette.neutral.border : theme.palette.primary.main,
    borderRadius: '50%',
    padding: theme.spacing(0.25),
}));

const StyledText = styled('span', {
    shouldForwardProp: (prop) => prop !== 'status',
})<{ status?: MilestoneStatus }>(({ theme, status }) => ({
    color: status === 'completed' ? theme.palette.text.secondary : theme.palette.text.primary,
    fontSize: theme.typography.body2.fontSize,
}));

interface IMilestoneTransitionDisplayProps {
    intervalMinutes: number;
    onDelete: () => void;
    milestoneName: string;
    status?: MilestoneStatus;
}

const formatInterval = (minutes: number): string => {
    if (minutes === 0) return '0 minutes';

    const duration = intervalToDuration({
        start: 0,
        end: minutes * 60 * 1000,
    });

    return formatDuration(duration, {
        format: ['days', 'hours', 'minutes'],
        delimiter: ', ',
    });
};

export const MilestoneTransitionDisplay = ({
    intervalMinutes,
    onDelete,
    milestoneName,
    status,
}: IMilestoneTransitionDisplayProps) => {
    return (
        <StyledDisplayContainer>
            <StyledContentGroup>
                <StyledIcon status={status} />
                <StyledText status={status}>
                    Proceed to the next milestone after{' '}
                    {formatInterval(intervalMinutes)}
                </StyledText>
            </StyledContentGroup>
            <IconButton
                onClick={onDelete}
                size='small'
                aria-label={`Delete automation for ${milestoneName}`}
                sx={{ padding: 0.5 }}
            >
                <DeleteOutlineIcon fontSize='small' />
            </IconButton>
        </StyledDisplayContainer>
    );
};
