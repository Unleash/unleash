import { ConditionallyRender } from '../../../../../common/ConditionallyRender/ConditionallyRender';
import { StrategySeparator } from '../../../../../common/StrategySeparator/StrategySeparator';
import { Box, Chip } from '@mui/material';
import { useStyles } from './PlaygroundResultStrategyExecution.styles';
import { PlaygroundFeatureStrategyResult } from '../../../../../../hooks/api/actions/usePlayground/playground.model';
import useUiConfig from '../../../../../../hooks/api/getters/useUiConfig/useUiConfig';
import React from 'react';
import { PlaygroundResultConstraintExecution } from '../PlaygroundResultConstraintExecution/PlaygroundResultConstraintExecution';
import { PlaygroundResultSegmentExecution } from '../PlaygroundResultSegmentExecution/PlaygroundResultSegmentExecution';

interface PlaygroundResultStrategyExecutionProps {
    strategyResult: PlaygroundFeatureStrategyResult;
    percentageFill?: string;
}

export const PlaygroundResultStrategyExecution = ({
    strategyResult,
}: PlaygroundResultStrategyExecutionProps) => {
    const { name, constraints, segments } = strategyResult;

    const { uiConfig } = useUiConfig();
    const { classes: styles } = useStyles();

    return (
        <>
            <ConditionallyRender
                condition={
                    Boolean(uiConfig.flags.SE) &&
                    Boolean(segments && segments.length > 0)
                }
                show={<PlaygroundResultSegmentExecution segments={segments} />}
            />
            <ConditionallyRender
                condition={Boolean(constraints && constraints.length > 0)}
                show={
                    <>
                        <PlaygroundResultConstraintExecution
                            constraints={constraints}
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
        </>
    );
};
