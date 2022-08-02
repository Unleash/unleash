import { ConditionallyRender } from '../../../../../../common/ConditionallyRender/ConditionallyRender';
import { StrategySeparator } from '../../../../../../common/StrategySeparator/StrategySeparator';
import { Box, Chip, styled } from '@mui/material';
import { useStyles } from './PlaygroundResultStrategyExecution.styles';
import {
    PlaygroundFeatureStrategyResult,
    PlaygroundRequestSchema,
} from '../../../../../../../hooks/api/actions/usePlayground/playground.model';
import useUiConfig from '../../../../../../../hooks/api/getters/useUiConfig/useUiConfig';
import React from 'react';
import { PlaygroundResultConstraintExecution } from '../PlaygroundResultConstraintExecution/PlaygroundResultConstraintExecution';
import { PlaygroundResultSegmentExecution } from '../PlaygroundResultSegmentExecution/PlaygroundResultSegmentExecution';

interface PlaygroundResultStrategyExecutionProps {
    strategyResult: PlaygroundFeatureStrategyResult;
    percentageFill?: string;
    input?: PlaygroundRequestSchema;
}

const StyledStrategyExecutionWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(1),
}));

export const PlaygroundResultStrategyExecution = ({
    strategyResult,
    input,
}: PlaygroundResultStrategyExecutionProps) => {
    const { name, constraints, segments } = strategyResult;

    const { uiConfig } = useUiConfig();
    const { classes: styles } = useStyles();

    const hasConstraints = Boolean(constraints && constraints.length > 0);

    return (
        <StyledStrategyExecutionWrapper>
            <ConditionallyRender
                condition={
                    Boolean(uiConfig.flags.SE) &&
                    Boolean(segments && segments.length > 0)
                }
                show={
                    <PlaygroundResultSegmentExecution
                        segments={segments}
                        hasConstraints={hasConstraints}
                        input={input}
                    />
                }
            />
            <ConditionallyRender
                condition={Boolean(constraints && constraints.length > 0)}
                show={
                    <>
                        <PlaygroundResultConstraintExecution
                            constraints={constraints}
                            compact={true}
                            input={input}
                        />
                        <StrategySeparator text="AND" />
                    </>
                }
            />
            <ConditionallyRender
                condition={name === 'default'}
                show={
                    <Box sx={{ width: '100%' }} className={styles.summary}>
                        The standard strategy is{' '}
                        <Chip
                            variant="outlined"
                            size="small"
                            color="success"
                            label="ON"
                        />{' '}
                        for all users.
                    </Box>
                }
            />
        </StyledStrategyExecutionWrapper>
    );
};
