import type { FC } from 'react';
import { Box, Paper, styled, Typography } from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import type {
    ChangeRequestSchedule,
    ChangeRequestState,
} from '../../changeRequest.types';
import { HtmlTooltip } from '../../../common/HtmlTooltip/HtmlTooltip';
import ErrorIcon from '@mui/icons-material/Error';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { formatDateYMDHMS } from 'utils/formatDate';

export type ISuggestChangeTimelineProps =
    | {
          state: Exclude<ChangeRequestState, 'Scheduled'>;
          schedule?: undefined;
      }
    | {
          state: 'Scheduled';
          schedule: ChangeRequestSchedule;
      };

const StyledPaper = styled(Paper)(({ theme }) => ({
    marginTop: theme.spacing(2),
    borderRadius: `${theme.shape.borderRadiusLarge}px`,
}));

const StyledBox = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    marginBottom: `-${theme.spacing(4)}`,
}));

const StyledSubtitle = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
}));

const StyledTimeline = styled(Timeline)(() => ({
    [`& .${timelineItemClasses.root}:before`]: {
        flex: 0,
        padding: 0,
    },
}));

const steps: ChangeRequestState[] = [
    'Draft',
    'In review',
    'Approved',
    'Applied',
];
const rejectedSteps: ChangeRequestState[] = ['Draft', 'In review', 'Rejected'];
const scheduledSteps: ChangeRequestState[] = [
    'Draft',
    'In review',
    'Approved',
    'Scheduled',
    'Applied',
];

export const determineColor = (
    changeRequestState: ChangeRequestState,
    changeRequestStateIndex: number,
    displayStage: ChangeRequestState,
    displayStageIndex: number,
) => {
    if (changeRequestState === 'Cancelled') return 'grey';

    if (changeRequestState === 'Rejected')
        return displayStage === 'Rejected' ? 'error' : 'success';
    if (
        changeRequestStateIndex !== -1 &&
        changeRequestStateIndex >= displayStageIndex
    )
        return 'success';

    if (changeRequestStateIndex + 1 === displayStageIndex) return 'primary';
    return 'grey';
};

export const ChangeRequestTimeline: FC<ISuggestChangeTimelineProps> = ({
    state,
    schedule,
}) => {
    let data: ChangeRequestState[];
    switch (state) {
        case 'Rejected':
            data = rejectedSteps;
            break;
        case 'Scheduled':
            data = scheduledSteps;
            break;
        default:
            data = steps;
    }
    const activeIndex = data.findIndex((item) => item === state);

    return (
        <StyledPaper elevation={0}>
            <StyledBox>
                <StyledTimeline>
                    {data.map((title, index) => {
                        if (schedule && title === 'Scheduled') {
                            return createTimelineScheduleItem(schedule);
                        }

                        const color = determineColor(
                            state,
                            activeIndex,
                            title,
                            index,
                        );
                        let timelineDotProps = {};

                        // Only add the outlined variant if it's the next step after the active one, but not for 'Draft' in 'Cancelled' state
                        if (
                            activeIndex + 1 === index &&
                            !(state === 'Cancelled' && title === 'Draft')
                        ) {
                            timelineDotProps = { variant: 'outlined' };
                        }

                        return createTimelineItem(
                            color,
                            title,
                            index < data.length - 1,
                            timelineDotProps,
                        );
                    })}
                </StyledTimeline>
            </StyledBox>
        </StyledPaper>
    );
};

const createTimelineItem = (
    color: 'primary' | 'success' | 'grey' | 'error' | 'warning',
    title: string,
    shouldConnectToNextItem: boolean,
    timelineDotProps: { [key: string]: string | undefined } = {},
) => (
    <TimelineItem key={title}>
        <TimelineSeparator>
            <TimelineDot color={color} {...timelineDotProps} />
            {shouldConnectToNextItem && <TimelineConnector />}
        </TimelineSeparator>
        <TimelineContent>{title}</TimelineContent>
    </TimelineItem>
);

export const getScheduleProps = (
    schedule: ChangeRequestSchedule,
    formattedTime: string,
) => {
    switch (schedule.status) {
        case 'suspended':
            return {
                title: 'Schedule suspended',
                subtitle: `was ${formattedTime}`,
                color: 'grey' as const,
                reason: (
                    <HtmlTooltip title={schedule.reason} arrow>
                        <ErrorIcon color={'disabled'} fontSize={'small'} />
                    </HtmlTooltip>
                ),
            };
        case 'failed':
            return {
                title: 'Schedule failed',
                subtitle: `at ${formattedTime}`,
                color: 'error' as const,
                reason: (
                    <HtmlTooltip
                        title={`Schedule failed because of ${
                            schedule.reason || schedule.failureReason
                        }`}
                        arrow
                    >
                        <ErrorIcon color={'error'} fontSize={'small'} />
                    </HtmlTooltip>
                ),
            };
        default:
            return {
                title: 'Scheduled',
                subtitle: `for ${formattedTime}`,
                color: 'warning' as const,
                reason: null,
            };
    }
};

const createTimelineScheduleItem = (schedule: ChangeRequestSchedule) => {
    const { locationSettings } = useLocationSettings();

    const time = formatDateYMDHMS(
        new Date(schedule.scheduledAt),
        locationSettings?.locale,
    );

    const { title, subtitle, color, reason } = getScheduleProps(schedule, time);

    return (
        <TimelineItem key={title}>
            <TimelineSeparator>
                <TimelineDot color={color} />
                <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
                {title}
                <StyledSubtitle>
                    <Typography
                        color={'text.secondary'}
                        sx={{ mr: 1 }}
                    >{`(${subtitle})`}</Typography>
                    {reason}
                </StyledSubtitle>
            </TimelineContent>
        </TimelineItem>
    );
};
