import { styled } from '@mui/material';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import { isToday, isTomorrow, addMinutes } from 'date-fns';
import { useUiFlag } from 'hooks/useUiFlag';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { formatDateHM, formatDateYMD } from 'utils/formatDate';
import type { MilestoneStatus } from './ReleasePlanMilestoneStatus.tsx';

export const formatSmartDate = (date: Date, locale: string): string => {
    const startTime = formatDateHM(date, locale);
    const endTime = formatDateHM(addMinutes(date, 2), locale);
    const timeRange = `between ${startTime} - ${endTime}`;

    if (isToday(date)) {
        return `today ${timeRange}`;
    }
    if (isTomorrow(date)) {
        return `tomorrow ${timeRange}`;
    }

    const dateString = formatDateYMD(date, locale);
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
    const { locationSettings } = useLocationSettings();

    if (!milestoneProgressionEnabled) {
        return null;
    }

    if (status.type !== 'not-started' || !status.scheduledAt) {
        return null;
    }

    const projectedStartTime = status.scheduledAt;

    if (!projectedStartTime) return null;

    return (
        <StyledTimeContainer>
            <StyledHourglassIcon />
            {`Starting ${formatSmartDate(projectedStartTime, locationSettings.locale)}`}
        </StyledTimeContainer>
    );
};
