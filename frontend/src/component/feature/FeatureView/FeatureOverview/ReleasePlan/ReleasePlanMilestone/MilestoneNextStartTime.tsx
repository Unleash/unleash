import { styled } from '@mui/material';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import type { IReleasePlanMilestone } from 'interfaces/releasePlans';
import { isToday, isTomorrow, format, addMinutes } from 'date-fns';
import { calculateMilestoneStartTime } from '../utils/calculateMilestoneStartTime.ts';
import { useUiFlag } from 'hooks/useUiFlag';

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

const StyledIcon = styled(HourglassEmptyOutlinedIcon)(({ theme }) => ({
    fontSize: 18,
    color: theme.palette.primary.main,
}));

interface IMilestoneNextStartTimeProps {
    milestone: IReleasePlanMilestone;
    allMilestones: IReleasePlanMilestone[];
    activeMilestoneId?: string;
}

export const MilestoneNextStartTime = ({
    milestone,
    allMilestones,
    activeMilestoneId,
}: IMilestoneNextStartTimeProps) => {
    const milestoneProgressionEnabled = useUiFlag('milestoneProgression');

    if (!milestoneProgressionEnabled) {
        return null;
    }

    const activeIndex = allMilestones.findIndex(
        (milestone) => milestone.id === activeMilestoneId,
    );
    const currentIndex = allMilestones.findIndex((m) => m.id === milestone.id);

    const isActiveMilestone = milestone.id === activeMilestoneId;
    const isBehindActiveMilestone =
        activeIndex !== -1 && currentIndex !== -1 && currentIndex < activeIndex;

    if (isActiveMilestone || isBehindActiveMilestone) {
        return null;
    }

    const projectedStartTime = calculateMilestoneStartTime(
        allMilestones,
        milestone.id,
        activeMilestoneId,
    );

    const text = projectedStartTime
        ? `Starting ${formatSmartDate(projectedStartTime)}`
        : 'Waiting to start';

    return (
        <StyledTimeContainer>
            <StyledIcon />
            {text}
        </StyledTimeContainer>
    );
};
