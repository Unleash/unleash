import { Fragment, VFC } from 'react';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { StrategySeparator } from 'component/common/StrategySeparator/StrategySeparator';
import { styled } from '@mui/material';
import { PlaygroundRequestSchema, PlaygroundStrategySchema } from 'openapi';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { ConstraintExecution } from './ConstraintExecution/ConstraintExecution';
import { SegmentExecution } from './SegmentExecution/SegmentExecution';
import { PlaygroundResultStrategyExecutionParameters } from './StrategyExecutionParameters/StrategyExecutionParameters';
import { CustomStrategyParams } from './CustomStrategyParams/CustomStrategyParams';
import { formattedStrategyNames } from 'utils/strategyNames';
import { StyledBoxSummary } from './StrategyExecution.styles';
import { Badge } from 'component/common/Badge/Badge';

interface IStrategyExecutionProps {
    strategyResult: PlaygroundStrategySchema;
    percentageFill?: string;
    input?: PlaygroundRequestSchema;
}

const StyledStrategyExecutionWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0),
}));

export const StrategyExecution: VFC<IStrategyExecutionProps> = ({
    strategyResult,
    input,
}) => {
    const { name, constraints, segments, parameters } = strategyResult;

    const { uiConfig } = useUiConfig();

    const hasSegments =
        Boolean(uiConfig.flags.SE) && Boolean(segments && segments.length > 0);
    const hasConstraints = Boolean(constraints && constraints?.length > 0);
    const hasExecutionParameters =
        name !== 'default' &&
        Object.keys(formattedStrategyNames).includes(name);
    const hasCustomStrategyParameters =
        Object.keys(parameters).length > 0 &&
        strategyResult.result.evaluationStatus === 'incomplete'; // Use of custom strategy can be more explicit from the API

    if (!parameters) {
        return null;
    }

    const items = [
        hasSegments && <SegmentExecution segments={segments} input={input} />,
        hasConstraints && (
            <ConstraintExecution constraints={constraints} input={input} />
        ),
        hasExecutionParameters && (
            <PlaygroundResultStrategyExecutionParameters
                parameters={parameters}
                constraints={constraints}
                input={input}
            />
        ),
        hasCustomStrategyParameters && (
            <CustomStrategyParams strategyName={name} parameters={parameters} />
        ),
        name === 'default' && (
            <StyledBoxSummary sx={{ width: '100%' }}>
                The standard strategy is <Badge color="success">ON</Badge> for
                all users.
            </StyledBoxSummary>
        ),
    ].filter(Boolean);

    return (
        <StyledStrategyExecutionWrapper>
            {items.map((item, index) => (
                <Fragment key={index}>
                    <ConditionallyRender
                        condition={index > 0}
                        show={<StrategySeparator text="AND" />}
                    />
                    {item}
                </Fragment>
            ))}
        </StyledStrategyExecutionWrapper>
    );
};
