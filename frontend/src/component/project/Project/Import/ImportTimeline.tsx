import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import React, { FC } from 'react';
import { Box, styled } from '@mui/material';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineContent from '@mui/lab/TimelineContent';
import Timeline from '@mui/lab/Timeline';
import { ImportStage } from './ImportStage';

const StyledTimeline = styled(Timeline)(() => ({
    [`& .${timelineItemClasses.root}:before`]: {
        flex: 0,
        padding: 0,
    },
}));

const StyledTimelineConnector = styled(TimelineConnector)(({ theme }) => ({
    width: '1px',
    backgroundColor: theme.palette.neutral.border,
}));

const StyledTimelineDot = styled(TimelineDot, {
    shouldForwardProp: prop => prop !== 'active',
})<{ active: boolean }>(({ theme, active }) => ({
    color: active ? theme.palette.primary.main : theme.palette.neutral.border,
    backgroundColor: active ? theme.palette.text.tertiaryContrast : 'initial',
    fontWeight: active ? theme.fontWeight.bold : theme.fontWeight.medium,
    borderColor: theme.palette.neutral.border,
    width: '40px',
    height: '40px',
    borderWidth: '1px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledTimelineContent = styled(TimelineContent, {
    shouldForwardProp: prop => prop !== 'active',
})<{ active: boolean }>(({ theme, active }) => ({
    marginBottom: theme.spacing(6),
    color: active
        ? theme.palette.text.tertiaryContrast
        : theme.palette.neutral.border,
    marginTop: theme.spacing(2),
}));

const TimelineItemTitle = styled(Box)(({ theme }) => ({
    fontWeight: theme.fontWeight.bold,
    fontSize: theme.fontSizes.bodySize,
}));

const TimelineItemDescription = styled(Box)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
}));

export const ImportTimeline: FC<{
    stage: ImportStage['name'];
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
                    <StyledTimelineConnector />
                </TimelineSeparator>
                <StyledTimelineContent active={stage === 'configure'}>
                    <TimelineItemTitle>Import file</TimelineItemTitle>
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
                    <StyledTimelineConnector />
                </TimelineSeparator>
                <StyledTimelineContent active={stage === 'validate'}>
                    <TimelineItemTitle>
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
                    <TimelineItemTitle>Finish import</TimelineItemTitle>
                    <TimelineItemDescription>
                        Feature toggle configuration will be imported to your
                        new Unleash instance
                    </TimelineItemDescription>
                </StyledTimelineContent>
            </TimelineItem>
        </StyledTimeline>
    );
};
