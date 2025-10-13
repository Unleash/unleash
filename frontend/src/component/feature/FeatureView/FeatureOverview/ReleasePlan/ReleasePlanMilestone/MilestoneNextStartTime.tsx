import { styled } from '@mui/material';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import type { IReleasePlanMilestone } from 'interfaces/releasePlans';
import { formatDateYMDHMS } from 'utils/formatDate';
import { isToday, isTomorrow, format } from 'date-fns';
import { calculateMilestoneStartTime } from '../utils/calculateMilestoneStartTime.ts';

const formatSmartDate = (date: Date): string => {
    const timeString = format(date, 'HH:mm');

    if (isToday(date)) {
        return `today at ${timeString}`;
    }
    if (isTomorrow(date)) {
        return `tomorrow at ${timeString}`;
    }

    // For other dates, show full date with time
    return formatDateYMDHMS(date);
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
    const activeIndex = allMilestones.findIndex(
        (m) => m.id === activeMilestoneId,
    );
    const currentIndex = allMilestones.findIndex((m) => m.id === milestone.id);

    // Hide if this is the active milestone or if it's behind the active milestone
    if (
        milestone.id === activeMilestoneId ||
        (activeIndex !== -1 && currentIndex !== -1 && currentIndex < activeIndex)
    ) {
        return null;
    }

    const projectedStartTime = calculateMilestoneStartTime(
        allMilestones,
        milestone.id,
        activeMilestoneId,
    );

    if (projectedStartTime) {
        return (
            <StyledTimeContainer>
                <StyledIcon />
                Starting {formatSmartDate(projectedStartTime)}
            </StyledTimeContainer>
        );
    }

    return (
        <StyledTimeContainer>
            <StyledIcon />
            Waiting to start
        </StyledTimeContainer>
    );
};
