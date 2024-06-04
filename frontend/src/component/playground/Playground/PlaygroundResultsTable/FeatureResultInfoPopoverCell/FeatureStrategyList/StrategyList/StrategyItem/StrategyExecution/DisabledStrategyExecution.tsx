import { Fragment, type VFC } from 'react';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { StrategySeparator } from 'component/common/StrategySeparator/StrategySeparator';
import { styled } from '@mui/material';
import type {
    PlaygroundRequestSchema,
    PlaygroundStrategySchema,
} from 'openapi';
import { PlaygroundResultStrategyExecutionParameters } from './StrategyExecutionParameters/StrategyExecutionParameters';
import { CustomStrategyParams } from './CustomStrategyParams/CustomStrategyParams';
import { formattedStrategyNames } from 'utils/strategyNames';
import { StyledBoxSummary } from './StrategyExecution.styles';
import { Badge } from 'component/common/Badge/Badge';
import { ConstraintExecutionWithoutResults } from './ConstraintExecution/ConstraintExecutionWithoutResults';
import { SegmentExecutionWithoutResult } from './SegmentExecution/SegmentExecutionWithoutResult';

interface IDisabledStrategyExecutionProps {
    strategyResult: PlaygroundStrategySchema;
    percentageFill?: string;
    input?: PlaygroundRequestSchema;
}

const StyledStrategyExecutionWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0),
}));

export const DisabledStrategyExecution: VFC<
    IDisabledStrategyExecutionProps
> = ({ strategyResult, input, percentageFill }) => {
    const { name, constraints, segments, parameters } = strategyResult;

    const hasSegments = Boolean(segments && segments.length > 0);
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
        hasSegments && <SegmentExecutionWithoutResult segments={segments} />,
        hasConstraints && (
            <ConstraintExecutionWithoutResults constraints={constraints} />
        ),
        hasExecutionParameters && (
            <PlaygroundResultStrategyExecutionParameters
                parameters={parameters}
                constraints={constraints}
                input={input}
                disabled
            />
        ),
        hasCustomStrategyParameters && (
            <CustomStrategyParams strategyName={name} parameters={parameters} />
        ),
        name === 'default' && (
            <StyledBoxSummary
                sx={(theme) => ({
                    width: '100%',
                    color: theme.palette.text.secondary,
                })}
            >
                The standard strategy is <Badge color={'disabled'}>ON</Badge>{' '}
                for all users.
            </StyledBoxSummary>
        ),
    ].filter(Boolean);

    return (
        <StyledStrategyExecutionWrapper>
            {items.map((item, index) => (
                <Fragment key={index}>
                    <ConditionallyRender
                        condition={
                            index > 0 &&
                            (strategyResult.name === 'flexibleRollout'
                                ? index < items.length
                                : index < items.length - 1)
                        }
                        show={<StrategySeparator text='AND' />}
                    />
                    {item}
                </Fragment>
            ))}
        </StyledStrategyExecutionWrapper>
    );
};
