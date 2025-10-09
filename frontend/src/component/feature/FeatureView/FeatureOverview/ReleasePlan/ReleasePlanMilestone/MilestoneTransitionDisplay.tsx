import BoltIcon from '@mui/icons-material/Bolt';
import { styled } from '@mui/material';

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

    const days = Math.floor(minutes / 1440);
    const hours = Math.floor((minutes % 1440) / 60);
    const mins = minutes % 60;

    const parts: string[] = [];

    if (days > 0) {
        parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
    }
    if (hours > 0) {
        parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
    }
    if (mins > 0) {
        parts.push(`${mins} ${mins === 1 ? 'minute' : 'minutes'}`);
    }

    return parts.join(', ');
};

export const MilestoneTransitionDisplay = ({
    intervalMinutes,
}: IMilestoneTransitionDisplayProps) => {
    return (
        <StyledDisplayContainer>
            <StyledIcon />
            <StyledText>
                Proceed to the next milestone after {formatInterval(intervalMinutes)}
            </StyledText>
        </StyledDisplayContainer>
    );
};
