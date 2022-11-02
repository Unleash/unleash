import { FC } from 'react';
import { Box, Paper } from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';

export const ChangeRequestTimeline: FC = () => {
    return (
        <Paper
            elevation={0}
            sx={theme => ({
                marginTop: theme.spacing(2),
                borderRadius: theme => `${theme.shape.borderRadiusLarge}px`,
            })}
        >
            <Box sx={theme => ({ padding: theme.spacing(2) })}>
                <Timeline
                    sx={{
                        [`& .${timelineItemClasses.root}:before`]: {
                            flex: 0,
                            padding: 0,
                        },
                    }}
                >
                    <TimelineItem>
                        <TimelineSeparator>
                            <TimelineDot color="success" />
                            <TimelineConnector color="success" />
                        </TimelineSeparator>
                        <TimelineContent>Draft</TimelineContent>
                    </TimelineItem>
                    <TimelineItem>
                        <TimelineSeparator>
                            <TimelineDot color="success" />
                            <TimelineConnector />
                        </TimelineSeparator>
                        <TimelineContent>Approved</TimelineContent>
                    </TimelineItem>
                    <TimelineItem>
                        <TimelineSeparator>
                            <TimelineDot />
                        </TimelineSeparator>
                        <TimelineContent>Applied</TimelineContent>
                    </TimelineItem>
                </Timeline>
            </Box>
        </Paper>
    );
};
