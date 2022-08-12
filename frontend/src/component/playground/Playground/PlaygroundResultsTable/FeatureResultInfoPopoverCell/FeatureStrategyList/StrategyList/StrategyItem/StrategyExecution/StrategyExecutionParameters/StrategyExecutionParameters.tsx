import {
    parseParameterNumber,
    parseParameterStrings,
} from 'utils/parseParameter';
import { Box, Chip } from '@mui/material';
import PercentageCircle from 'component/common/PercentageCircle/PercentageCircle';
import { PlaygroundParameterItem } from '../PlaygroundParameterItem/PlaygroundParameterItem';
import React from 'react';
import { useStyles } from '../StrategyExecution.styles';
import {
    PlaygroundConstraintSchema,
    PlaygroundRequestSchema,
} from 'component/playground/Playground/interfaces/playground.model';
import { getMappedParam } from '../helpers';

export interface PlaygroundResultStrategyExecutionParametersProps {
    parameters: { [key: string]: string };
    constraints: PlaygroundConstraintSchema[];
    input?: PlaygroundRequestSchema;
}

export const PlaygroundResultStrategyExecutionParameters = ({
    parameters,
    constraints,
    input,
}: PlaygroundResultStrategyExecutionParametersProps) => {
    const { classes: styles } = useStyles();

    return (
        <>
            {Object.keys(parameters).map(key => {
                switch (key) {
                    case 'rollout':
                    case 'Rollout':
                        const percentage = parseParameterNumber(
                            parameters[key]
                        );
                        return (
                            <Box
                                className={styles.summary}
                                key={key}
                                sx={{ display: 'flex', alignItems: 'center' }}
                            >
                                <Box sx={{ mr: '1rem' }}>
                                    <PercentageCircle
                                        percentage={percentage}
                                        size="2rem"
                                    />
                                </Box>
                                <div>
                                    <Chip
                                        color="success"
                                        variant="outlined"
                                        size="small"
                                        label={`${percentage}%`}
                                    />{' '}
                                    of your base{' '}
                                    {constraints.length > 0
                                        ? 'who match constraints'
                                        : ''}{' '}
                                    is included.
                                </div>
                            </Box>
                        );
                    case 'userIds':
                    case 'UserIds':
                        const users = parseParameterStrings(parameters[key]);
                        return (
                            <PlaygroundParameterItem
                                key={key}
                                value={users}
                                text="user"
                                input={
                                    Boolean(
                                        input?.context?.[getMappedParam(key)]
                                    )
                                        ? input?.context?.[getMappedParam(key)]
                                        : 'no value'
                                }
                                showReason={
                                    Boolean(
                                        input?.context?.[getMappedParam(key)]
                                    )
                                        ? !users.includes(
                                              input?.context?.[
                                                  getMappedParam(key)
                                              ]
                                          )
                                        : undefined
                                }
                            />
                        );
                    case 'hostNames':
                    case 'HostNames':
                        const hosts = parseParameterStrings(parameters[key]);
                        return (
                            <PlaygroundParameterItem
                                key={key}
                                value={hosts}
                                text={'host'}
                                input={'no value'}
                                showReason={undefined}
                            />
                        );
                    case 'IPs':
                        const IPs = parseParameterStrings(parameters[key]);
                        return (
                            <PlaygroundParameterItem
                                key={key}
                                value={IPs}
                                text={'IP'}
                                input={
                                    Boolean(
                                        input?.context?.[getMappedParam(key)]
                                    )
                                        ? input?.context?.[getMappedParam(key)]
                                        : 'no value'
                                }
                                showReason={
                                    Boolean(
                                        input?.context?.[getMappedParam(key)]
                                    )
                                        ? !IPs.includes(
                                              input?.context?.[
                                                  getMappedParam(key)
                                              ]
                                          )
                                        : undefined
                                }
                            />
                        );
                    case 'stickiness':
                    case 'groupId':
                        return null;
                    default:
                        return null;
                }
            })}
        </>
    );
};
