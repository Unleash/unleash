import { FC } from 'react';
import { Box, Paper, styled, Typography } from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import {
    ChangeRequestSchedule,
    ChangeRequestState,
} from '../../changeRequest.types';
import { ConditionallyRender } from '../../../common/ConditionallyRender/ConditionallyRender';
import { HtmlTooltip } from '../../../common/HtmlTooltip/HtmlTooltip';
import { Error as ErrorIcon } from '@mui/icons-material';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { formatDateYMDHMS } from 'utils/formatDate';

type ISuggestChangeTimelineProps =
    | {
          state: Exclude<ChangeRequestState, 'Scheduled'>;
          schedule: undefined;
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
    failureReason?: string,
) => {
    if (changeRequestState === 'Cancelled') return 'grey';

    if (changeRequestState === 'Rejected')
        return displayStage === 'Rejected' ? 'error' : 'success';
    if (
        changeRequestStateIndex !== -1 &&
        changeRequestStateIndex > displayStageIndex
    )
        return 'success';
    if (
        changeRequestStateIndex !== -1 &&
        changeRequestStateIndex === displayStageIndex
    ) {
        return changeRequestState === 'Scheduled'
            ? failureReason
                ? 'error'
                : 'warning'
            : 'success';
    }

    if (changeRequestStateIndex + 1 === displayStageIndex) return 'primary';
    return 'grey';
};

export const ChangeRequestTimeline: FC<ISuggestChangeTimelineProps> = ({
    state,
    schedule,
}) => {
    let data;
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
                        console.log('title and state ++', title, state);
                        if (schedule && title === 'Scheduled') {
                            console.log('Title for scheduled is', title, state);

                            return createTimelineScheduleItem(
                                schedule,
                                // color,
                                // title,
                                // index < data.length - 1,
                                // timelineDotProps,
                            );
                        }

                        // const subtitle =
                        //     scheduledAt &&
                        //     state === 'Scheduled' &&
                        //     state === title
                        //         ? formatDateYMDHMS(
                        //               new Date(scheduledAt),
                        //               locationSettings?.locale,
                        //           )
                        //         : undefined;
                        const color = determineColor(
                            state,
                            activeIndex,
                            title,
                            index,
                            // failureReason,
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

const createTimelineScheduleItem = (
    schedule: ChangeRequestSchedule,
    // color: 'primary' | 'success' | 'grey' | 'error' | 'warning',
    // title: string,
    // subtitle: string | undefined,
    // failureReason: string | undefined,
    // shouldConnectToNextItem: boolean,
    // timelineDotProps: { [key: string]: string | undefined } = {},
) => {
    const { locationSettings } = useLocationSettings();

    const time = formatDateYMDHMS(
        new Date(schedule.scheduledAt),
        locationSettings?.locale,
    );

    const color = (() => {
        switch (schedule.status) {
            case 'suspended':
                return 'grey';
            case 'failed':
                return 'error';
            case 'pending':
            default:
                return 'warning';
        }
    })();

    const title = `Schedule ${schedule.status}`;

    const subtitle = (() => {
        switch (schedule.status) {
            case 'suspended':
                return `was ${time}`;
            case 'failed':
                return `at ${time}`;
            case 'pending':
            default:
                return `for ${time}`;
        }
    })();

    const reason = (() => {
        switch (schedule.status) {
            case 'suspended':
                return (
                    <HtmlTooltip title={schedule.reason} arrow>
                        <ErrorIcon color={'error'} fontSize={'small'} />
                    </HtmlTooltip>
                );
            case 'failed':
                return (
                    <HtmlTooltip
                        title={`Schedule failed because of ${
                            schedule.reason || schedule.failureReason
                        }`}
                        arrow
                    >
                        <ErrorIcon color={'error'} fontSize={'small'} />
                    </HtmlTooltip>
                );
            case 'pending':
            default:
                return <></>;
        }
    })();

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
