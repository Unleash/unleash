import { styled } from '@mui/material';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import { isToday, isTomorrow, format, addMinutes } from 'date-fns';
import { useUiFlag } from 'hooks/useUiFlag';
import type { MilestoneStatus } from './ReleasePlanMilestoneStatus.tsx';

export const formatSmartDate = (date: Date): string => {
    const startTime = format(date, 'HH:mm');
    const endTime = format(addMinutes(date, 2), 'HH:mm');
    const timeRange = `between ${startTime} - ${endTime}`;

    if (isToday(date)) {
        return `today ${timeRange}`;
    }
    if (isTomorrow(date)) {
        return `tomorrow ${timeRange}`;
    }

    // For other dates, show full date with time range
    const dateString = format(date, 'yyyy-MM-dd');
    return `${dateString} ${timeRange}`;
};

const StyledTimeContainer = styled('span')(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(0.75),
    color: theme.palette.text.primary,
    fontSize: theme.fontSizes.smallBody,
    fontWeight: theme.typography.fontWeightRegular,
    backgroundColor: theme.palette.background.elevation1,
    padding: theme.spacing(0.5, 1),
    borderRadius: theme.shape.borderRadiusLarge,
}));

const StyledHourglassIcon = styled(HourglassEmptyOutlinedIcon)(({ theme }) => ({
    fontSize: 18,
    color: theme.palette.primary.main,
}));

interface IMilestoneNextStartTimeProps {
    status: MilestoneStatus;
}

export const MilestoneNextStartTime = ({
    status,
}: IMilestoneNextStartTimeProps) => {
    const milestoneProgressionEnabled = useUiFlag('milestoneProgression');

    if (!milestoneProgressionEnabled) {
        return null;
    }

    // Only show for not-started milestones with scheduledAt
    if (status.type !== 'not-started' || !status.scheduledAt) {
        return null;
    }

    const projectedStartTime = status.scheduledAt;

    if (!projectedStartTime) return null;

    return (
        <StyledTimeContainer>
            <StyledHourglassIcon />
            {`Starting ${formatSmartDate(projectedStartTime)}`}
        </StyledTimeContainer>
    );
};
