import { FC } from 'react';
import { Box, Paper, styled } from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import { ChangeRequestState } from '../../changeRequest.types';

interface ISuggestChangeTimelineProps {
    state: ChangeRequestState;
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

export const determineColor = (
    displayStage: ChangeRequestState,
    changeRequestState: ChangeRequestState,
    activeIndex: number,
    index: number
) => {
    if (changeRequestState === 'Cancelled') return 'grey';
    if (changeRequestState === 'Rejected')
        return displayStage === 'Rejected' ? 'error' : 'success';
    if (activeIndex !== -1 && activeIndex >= index) return 'success';
    if (activeIndex + 1 === index) return 'primary';
    return 'grey';
};

export const ChangeRequestTimeline: FC<ISuggestChangeTimelineProps> = ({
    state,
}) => {
    const data = state === 'Rejected' ? rejectedSteps : steps;
    const activeIndex = data.findIndex(item => item === state);

    return (
        <StyledPaper elevation={0}>
            <StyledBox>
                <StyledTimeline>
                    {data.map((title, index) => {
                        const color = determineColor(
                            title,
                            state,
                            activeIndex,
                            index
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
                            timelineDotProps
                        );
                    })}
                </StyledTimeline>
            </StyledBox>
        </StyledPaper>
    );
};

const createTimelineItem = (
    color: 'primary' | 'success' | 'grey' | 'error',
    title: string,
    shouldConnectToNextItem: boolean,
    timelineDotProps: { [key: string]: string | undefined } = {}
) => (
    <TimelineItem key={title}>
        <TimelineSeparator>
            <TimelineDot color={color} {...timelineDotProps} />
            {shouldConnectToNextItem && <TimelineConnector />}
        </TimelineSeparator>
        <TimelineContent>{title}</TimelineContent>
    </TimelineItem>
);
