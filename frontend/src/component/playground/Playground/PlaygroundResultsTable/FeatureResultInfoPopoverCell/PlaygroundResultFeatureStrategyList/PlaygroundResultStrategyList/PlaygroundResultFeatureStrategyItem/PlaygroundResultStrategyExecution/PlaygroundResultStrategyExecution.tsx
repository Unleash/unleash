import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { StrategySeparator } from 'component/common/StrategySeparator/StrategySeparator';
import { Box, Chip, styled } from '@mui/material';
import { useStyles } from './PlaygroundResultStrategyExecution.styles';
import {
    PlaygroundRequestSchema,
    PlaygroundStrategySchema,
} from 'hooks/api/actions/usePlayground/playground.model';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { PlaygroundResultConstraintExecution } from './PlaygroundResultConstraintExecution/PlaygroundResultConstraintExecution';
import { PlaygroundResultSegmentExecution } from './PlaygroundResultSegmentExecution/PlaygroundResultSegmentExecution';
import { PlaygroundResultStrategyExecutionParameters } from './PlaygroundResultStrategyExecutionParameters/PlaygroundResultStrategyExecutionParameters';
import { PlaygroundResultStrategyExecutionCustomStrategyParams } from './PlaygroundResultStrategyExecutionCustomStrategyParams/PlaygroundResultStrategyExecutionCustomStrategyParams';

interface PlaygroundResultStrategyExecutionProps {
    strategyResult: PlaygroundStrategySchema;
    percentageFill?: string;
    input?: PlaygroundRequestSchema;
}

const StyledStrategyExecutionWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0),
}));

const StyledParamWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 0),
}));

export const PlaygroundResultStrategyExecution = ({
    strategyResult,
    input,
}: PlaygroundResultStrategyExecutionProps) => {
    const { name, constraints, segments, parameters } = strategyResult;

    const { uiConfig } = useUiConfig();
    const { classes: styles } = useStyles();

    const hasConstraints = Boolean(constraints && constraints.length > 0);
    const hasParameters = Object.keys(parameters).length === 0;

    if (!parameters) {
        return null;
    }

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
                        <ConditionallyRender
                            condition={Boolean(
                                constraints &&
                                    constraints.length > 0 &&
                                    !hasParameters
                            )}
                            show={<StrategySeparator text="AND" />}
                        />
                    </>
                }
            />
            <ConditionallyRender
                condition={name === 'default'}
                show={
                    <Box sx={{ width: '100%' }} className={styles.summary}>
                        The standard strategyResult is{' '}
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
            <StyledParamWrapper>
                <PlaygroundResultStrategyExecutionParameters
                    parameters={parameters}
                    constraints={constraints}
                    input={input}
                />
                <StyledParamWrapper sx={{ pt: 2 }}>
                    <PlaygroundResultStrategyExecutionCustomStrategyParams
                        strategyName={strategyResult.name}
                        parameters={parameters}
                        constraints={constraints}
                    />
                </StyledParamWrapper>
            </StyledParamWrapper>
        </StyledStrategyExecutionWrapper>
    );
};
