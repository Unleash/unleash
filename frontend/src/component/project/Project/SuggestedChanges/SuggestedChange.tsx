import { useState, FC } from 'react';
import {
    Box,
    Paper,
    Button,
    Typography,
    Card,
    Popover,
    Radio,
    FormControl,
    FormControlLabel,
    RadioGroup,
} from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';

import { useSuggestedChange } from 'hooks/api/getters/useSuggestChange/useSuggestedChange';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { ChangesetDiff } from './ChangesetDiff/ChangesetDiff';
import { ChangesHeader } from './ChangesHeader/ChangesHeader';
import { PlaygroundResultChip } from 'component/playground/Playground/PlaygroundResultsTable/PlaygroundResultChip/PlaygroundResultChip';

export const SuggestedChange: FC = () => {
    const { data: changeRequest } = useSuggestedChange();
    console.log(changeRequest);

    return (
        <>
            <Paper
                elevation={0}
                sx={{
                    p: 4,
                    borderRadius: theme => `${theme.shape.borderRadiusLarge}px`,
                }}
            >
                <Box sx={theme => ({ padding: theme.spacing(2) })}>
                    <Typography
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                        }}
                        variant="h1"
                    >
                        Suggestion
                        <Typography
                            sx={theme => ({
                                marginLeft: theme.spacing(1),
                            })}
                            variant="h1"
                            component="p"
                        >
                            #{changeRequest.id}
                        </Typography>
                    </Typography>
                </Box>
            </Paper>

            <Box sx={{ display: 'flex' }}>
                <Box
                    sx={{
                        width: '30%',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <Paper
                        elevation={0}
                        sx={theme => ({
                            marginTop: theme.spacing(2),
                            padding: 4,
                            borderRadius: theme =>
                                `${theme.shape.borderRadiusLarge}px`,
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

                    <Paper
                        elevation={0}
                        sx={theme => ({
                            marginTop: theme.spacing(2),

                            padding: 4,
                            borderRadius: theme =>
                                `${theme.shape.borderRadiusLarge}px`,
                        })}
                    >
                        <Box sx={theme => ({ padding: theme.spacing(2) })}>
                            Reviewers
                        </Box>
                    </Paper>
                </Box>

                <Paper
                    elevation={0}
                    sx={theme => ({
                        marginTop: theme.spacing(2),
                        marginLeft: theme.spacing(2),
                        width: '70%',
                        padding: 4,
                        borderRadius: theme =>
                            `${theme.shape.borderRadiusLarge}px`,
                    })}
                >
                    <Box
                        sx={theme => ({
                            padding: theme.spacing(2),
                        })}
                    >
                        Changes
                        {changeRequest.changes?.map((item: any) => (
                            <Card
                                key={item.feature}
                                elevation={0}
                                sx={{
                                    borderRadius: theme =>
                                        `${theme.shape.borderRadius}px`,
                                    overflow: 'hidden',
                                    border: '1px solid',
                                    borderColor: theme =>
                                        theme.palette.dividerAlternative,
                                }}
                            >
                                <Box
                                    sx={{
                                        backgroundColor: theme =>
                                            theme.palette.tableHeaderBackground,
                                        p: 2,
                                    }}
                                >
                                    <Typography>{item.feature}</Typography>
                                </Box>
                                <Box sx={{ p: 2 }}>
                                    {/*
                      // @ts-ignore FIXME: types */}
                                    <ConditionallyRender
                                        condition={
                                            item.action === 'updateEnabled'
                                        }
                                        show={
                                            <Box
                                                sx={{
                                                    marginTop: theme.spacing(2),
                                                }}
                                                key={item?.id}
                                            >
                                                New status:{' '}
                                                <PlaygroundResultChip
                                                    showIcon={false}
                                                    label={
                                                        item?.payload.data ===
                                                        true
                                                            ? 'Enabled'
                                                            : 'Disabled'
                                                    }
                                                    enabled={
                                                        item?.payload.data ===
                                                        true
                                                    }
                                                />
                                            </Box>
                                        }
                                    />
                                </Box>
                            </Card>
                        ))}
                    </Box>
                </Paper>
            </Box>
        </>
    );
};
