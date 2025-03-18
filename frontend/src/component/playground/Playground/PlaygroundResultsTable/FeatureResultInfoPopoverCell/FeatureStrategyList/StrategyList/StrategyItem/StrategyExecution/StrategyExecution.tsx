import type {
    PlaygroundRequestSchema,
    PlaygroundStrategySchema,
} from 'openapi';
import { ConstraintExecution } from './ConstraintExecution/ConstraintExecution';
import { SegmentExecution } from './SegmentExecution/SegmentExecution';
import { formattedStrategyNames } from 'utils/strategyNames';
import { StyledBoxSummary } from './StrategyExecution.styles';
import { Badge } from 'component/common/Badge/Badge';
import { ConstraintsList } from 'component/common/ConstraintsList/ConstraintsList';
import { objectId } from 'utils/objectId';
import type { FC } from 'react';
import { useStrategyParameters } from 'component/feature/FeatureView/FeatureOverview/FeatureOverviewEnvironments/FeatureOverviewEnvironment/EnvironmentAccordionBody/StrategyDraggableItem/StrategyItem/StrategyExecution/hooks/useStrategyParameters';
import { useStrategies } from 'hooks/api/getters/useStrategies/useStrategies';
import { useCustomStrategyParameters } from 'component/feature/FeatureView/FeatureOverview/FeatureOverviewEnvironments/FeatureOverviewEnvironment/EnvironmentAccordionBody/StrategyDraggableItem/StrategyItem/StrategyExecution/hooks/useCustomStrategyParameters';

type StrategyExecutionProps = {
    strategyResult: PlaygroundStrategySchema;
    percentageFill?: string;
    input?: PlaygroundRequestSchema;
};

export const StrategyExecution: FC<StrategyExecutionProps> = ({
    strategyResult,
    input,
}) => {
    const { name, constraints, segments, parameters } = strategyResult;
    const params = useStrategyParameters(strategyResult);

    const { strategies } = useStrategies();
    const { isCustomStrategy, customStrategyParameters: customStrategyItems } =
        useCustomStrategyParameters(strategyResult, strategies);

    const hasSegments = Boolean(segments && segments.length > 0);
    const hasConstraints = Boolean(constraints && constraints?.length > 0);
    const hasExecutionParameters =
        name !== 'default' &&
        Object.keys(formattedStrategyNames).includes(name);

    if (!parameters) {
        return null;
    }

    const items = [
        hasSegments && <SegmentExecution segments={segments} input={input} />,
        ...(hasConstraints
            ? constraints.map((constraint) => (
                  <ConstraintExecution
                      key={objectId(constraint)}
                      constraint={constraint}
                      input={input}
                  />
              ))
            : []),
        hasExecutionParameters && params,
        isCustomStrategy && customStrategyItems,
        name === 'default' && (
            <StyledBoxSummary sx={{ width: '100%' }}>
                The standard strategy is <Badge color='success'>ON</Badge> for
                all users.
            </StyledBoxSummary>
        ),
    ].filter(Boolean);

    return <ConstraintsList>{items}</ConstraintsList>;
};
