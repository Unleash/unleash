import { FC, Fragment } from 'react';
import { Avatar, Box, Card, Paper, Typography } from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import TimeAgo from 'react-timeago';
import { useSuggestedChange } from 'hooks/api/getters/useSuggestChange/useSuggestedChange';
import { StyledTrueChip } from 'component/playground/Playground/PlaygroundResultsTable/PlaygroundResultChip/PlaygroundResultChip';
import { ReactComponent as ChangesAppliedIcon } from 'assets/icons/merge.svg';
import { SuggestedFeatureToggleChange } from './SuggestedFeatureToggleChange/SuggestedFeatureToggleChange';
import { ToggleStatusChange } from './SuggestedFeatureToggleChange/ToggleStatusChange';
import { ConditionallyRender } from '../../../common/ConditionallyRender/ConditionallyRender';
import {
    StrategyAddedChange,
    StrategyDeletedChange,
    StrategyEditedChange,
} from './SuggestedFeatureToggleChange/StrategyChange';
import { objectId } from '../../../../utils/objectId';

export const SuggestedChange: FC = () => {
    const { data: suggestedChange } = useSuggestedChange();

    return (
        <>
            <Paper
                elevation={0}
                sx={theme => ({
                    p: theme.spacing(2, 4),
                    borderRadius: theme => `${theme.shape.borderRadiusLarge}px`,
                })}
            >
                <Box
                    sx={theme => ({
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        marginBottom: theme.spacing(2),
                    })}
                >
                    <Typography
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                        }}
                        variant="h1"
                    >
                        Suggestion
                        <Typography variant="h1" component="p">
                            #{suggestedChange.id}
                        </Typography>
                    </Typography>
                    <StyledTrueChip
                        icon={<ChangesAppliedIcon strokeWidth="0.25" />}
                        label="Changes applied"
                    />
                </Box>
                <Box sx={{ display: 'flex', verticalAlign: 'center', gap: 2 }}>
                    <Typography sx={{ margin: 'auto 0' }}>
                        Created{' '}
                        <TimeAgo date={new Date(suggestedChange.createdAt)} />{' '}
                        by
                    </Typography>
                    <Avatar src={suggestedChange?.createdBy?.avatar} />
                    <Card
                        variant="outlined"
                        sx={theme => ({
                            padding: 1,
                            backgroundColor: theme.palette.tertiary.light,
                        })}
                    >
                        Environment:{' '}
                        <Typography display="inline" fontWeight="bold">
                            {suggestedChange?.environment}
                        </Typography>{' '}
                        | Updates:{' '}
                        <Typography display="inline" fontWeight="bold">
                            {suggestedChange?.changes.length} feature toggles
                        </Typography>
                    </Card>
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
                            marginTop: theme.spacing(1),
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
                        {suggestedChange.changes?.map(
                            (featureToggleChange: any) => (
                                <SuggestedFeatureToggleChange
                                    key={featureToggleChange.feature}
                                    featureToggleName={
                                        featureToggleChange.feature
                                    }
                                >
                                    {featureToggleChange.changeSet.map(
                                        (change: any) => (
                                            <Fragment key={objectId(change)}>
                                                <ConditionallyRender
                                                    condition={
                                                        change.action ===
                                                        'updateEnabled'
                                                    }
                                                    show={
                                                        <ToggleStatusChange
                                                            enabled={
                                                                change?.payload
                                                                    .data.data
                                                            }
                                                        />
                                                    }
                                                />
                                                <ConditionallyRender
                                                    condition={
                                                        change.action ===
                                                        'addStrategy'
                                                    }
                                                    show={
                                                        <StrategyAddedChange />
                                                    }
                                                />
                                                <ConditionallyRender
                                                    condition={
                                                        change.action ===
                                                        'deleteStrategy'
                                                    }
                                                    show={
                                                        <StrategyDeletedChange />
                                                    }
                                                />
                                                <ConditionallyRender
                                                    condition={
                                                        change.action ===
                                                        'updateStrategy'
                                                    }
                                                    show={
                                                        <StrategyEditedChange />
                                                    }
                                                />
                                            </Fragment>
                                        )
                                    )}
                                </SuggestedFeatureToggleChange>
                            )
                        )}
                    </Box>
                </Paper>
            </Box>
        </>
    );
};
