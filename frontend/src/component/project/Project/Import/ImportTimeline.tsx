import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import React, { FC } from 'react';
import { alpha, Box, styled } from '@mui/material';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineContent from '@mui/lab/TimelineContent';
import Timeline from '@mui/lab/Timeline';
import { StageName } from './StageName';

const StyledTimeline = styled(Timeline)(() => ({
    padding: 0,
    margin: 0,

    [`& .${timelineItemClasses.root}:before`]: {
        flex: 0,
        padding: 0,
    },
}));

const StyledTimelineConnector = styled(TimelineConnector, {
    shouldForwardProp: prop => prop !== 'active',
})<{ active: boolean }>(({ theme, active }) => ({
    width: '1px',
    backgroundColor: active
        ? theme.palette.common.white
        : `${alpha(theme.palette.common.white, 0.5)}`,
}));

const StyledTimelineDot = styled(TimelineDot, {
    shouldForwardProp: prop => prop !== 'active',
})<{ active: boolean }>(({ theme, active }) => ({
    color: active
        ? theme.palette.background.sidebar
        : `${alpha(theme.palette.common.white, 0.8)}`,
    backgroundColor: active ? theme.palette.common.white : 'initial',
    fontWeight: active ? theme.fontWeight.bold : 'normal',
    borderColor: active
        ? theme.palette.common.white
        : `${alpha(theme.palette.common.white, 0.8)}`,
    width: theme.spacing(5),
    height: theme.spacing(5),
    lineHeight: theme.spacing(5),
    borderWidth: '1px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: theme.spacing(1, 0),
}));

const StyledTimelineContent = styled(TimelineContent, {
    shouldForwardProp: prop => prop !== 'active',
})<{ active: boolean }>(({ theme, active }) => ({
    padding: theme.spacing(2, 2, 6, 2),
    color: active
        ? theme.palette.common.white
        : `${alpha(theme.palette.common.white, 0.8)}`,
}));

const TimelineItemTitle = styled(Box, {
    shouldForwardProp: prop => prop !== 'active',
})<{ active: boolean }>(({ theme, active }) => ({
    fontWeight: active ? theme.fontWeight.bold : 'normal',
    fontSize: theme.fontSizes.bodySize,
}));

const TimelineItemDescription = styled(Box)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
}));

export const ImportTimeline: FC<{
    stage: StageName;
}> = ({ stage }) => {
    return (
        <StyledTimeline>
            <TimelineItem>
                <TimelineSeparator>
                    <StyledTimelineDot
                        variant="outlined"
                        active={stage === 'configure'}
                    >
                        1
                    </StyledTimelineDot>
                    <StyledTimelineConnector active={stage === 'configure'} />
                </TimelineSeparator>
                <StyledTimelineContent active={stage === 'configure'}>
                    <TimelineItemTitle active={stage === 'configure'}>
                        Import file
                    </TimelineItemTitle>
                    <TimelineItemDescription>
                        Import previously exported toggle configuration from
                        another Unleash instance as a JSON file
                    </TimelineItemDescription>
                </StyledTimelineContent>
            </TimelineItem>
            <TimelineItem>
                <TimelineSeparator>
                    <StyledTimelineDot
                        variant="outlined"
                        active={stage === 'validate'}
                    >
                        2
                    </StyledTimelineDot>
                    <StyledTimelineConnector active={stage === 'validate'} />
                </TimelineSeparator>
                <StyledTimelineContent active={stage === 'validate'}>
                    <TimelineItemTitle active={stage === 'validate'}>
                        Validate configuration
                    </TimelineItemTitle>
                    <TimelineItemDescription>
                        Check the errors and warnings from the import process
                    </TimelineItemDescription>
                </StyledTimelineContent>
            </TimelineItem>
            <TimelineItem>
                <TimelineSeparator>
                    <StyledTimelineDot
                        variant="outlined"
                        active={stage === 'import'}
                    >
                        3
                    </StyledTimelineDot>
                </TimelineSeparator>
                <StyledTimelineContent active={stage === 'import'}>
                    <TimelineItemTitle active={stage === 'import'}>
                        Finish import
                    </TimelineItemTitle>
                    <TimelineItemDescription>
                        Feature toggle configuration will be imported to your
                        new Unleash instance
                    </TimelineItemDescription>
                </StyledTimelineContent>
            </TimelineItem>
        </StyledTimeline>
    );
};
