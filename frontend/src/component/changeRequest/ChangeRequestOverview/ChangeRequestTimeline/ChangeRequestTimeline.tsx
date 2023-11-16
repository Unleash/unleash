import { FC } from 'react';
import { Box, Paper, styled, Typography } from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import { ChangeRequestState } from '../../changeRequest.types';

interface ISuggestChangeTimelineProps {
    state: ChangeRequestState;
    scheduledAt?: string;
}

const StyledPaper = styled(Paper)(({ theme }) => ({
    marginTop: theme.spacing(2),
    borderRadius: `${theme.shape.borderRadiusLarge}px`,
}));

const StyledBox = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    marginBottom: `-${theme.spacing(4)}`,
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
        changeRequestStateIndex > displayStageIndex
    )
        return 'success';
    if (
        changeRequestStateIndex !== -1 &&
        changeRequestStateIndex === displayStageIndex
    ) {
        return changeRequestState === 'Scheduled' ? 'warning' : 'success';
    }

    if (changeRequestStateIndex + 1 === displayStageIndex) return 'primary';
    return 'grey';
};

export const ChangeRequestTimeline: FC<ISuggestChangeTimelineProps> = ({
    state,
    scheduledAt,
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
                        const subtitle =
                            scheduledAt &&
                            state === 'Scheduled' &&
                            state === title
                                ? new Date(scheduledAt).toLocaleString()
                                : undefined;
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
                            subtitle,
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
    subtitle: string | undefined,
    shouldConnectToNextItem: boolean,
    timelineDotProps: { [key: string]: string | undefined } = {},
) => (
    <TimelineItem key={title}>
        <TimelineSeparator>
            <TimelineDot color={color} {...timelineDotProps} />
            {shouldConnectToNextItem && <TimelineConnector />}
        </TimelineSeparator>
        <TimelineContent>
            {title}
            <br />
            {subtitle && (
                <Typography
                    color={'text.secondary'}
                >{`(for ${subtitle})`}</Typography>
            )}
        </TimelineContent>
    </TimelineItem>
);
