import BoltIcon from '@mui/icons-material/Bolt';
import { styled } from '@mui/material';
import { formatDuration, intervalToDuration } from 'date-fns';

const StyledDisplayContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const StyledIcon = styled(BoltIcon)(({ theme }) => ({
    color: theme.palette.common.white,
    fontSize: 18,
    flexShrink: 0,
    backgroundColor: theme.palette.primary.main,
    borderRadius: '50%',
    padding: theme.spacing(0.25),
}));

const StyledText = styled('span')(({ theme }) => ({
    color: theme.palette.text.primary,
    fontSize: theme.typography.body2.fontSize,
}));

interface IMilestoneTransitionDisplayProps {
    intervalMinutes: number;
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
}: IMilestoneTransitionDisplayProps) => {
    return (
        <StyledDisplayContainer>
            <StyledIcon />
            <StyledText>
                Proceed to the next milestone after{' '}
                {formatInterval(intervalMinutes)}
            </StyledText>
        </StyledDisplayContainer>
    );
};
