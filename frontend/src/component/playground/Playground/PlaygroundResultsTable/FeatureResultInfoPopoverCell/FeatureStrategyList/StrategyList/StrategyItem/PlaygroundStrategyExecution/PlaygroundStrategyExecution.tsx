import type {
    PlaygroundFeatureSchemaVariant,
    PlaygroundRequestSchema,
    PlaygroundStrategySchema,
    StrategyVariantSchema,
} from 'openapi';
import { ConstraintExecution } from './ConstraintExecution/ConstraintExecution.tsx';
import { formattedStrategyNames } from 'utils/strategyNames';
import { StyledBoxSummary } from './StrategyExecution.styles';
import { Badge } from 'component/common/Badge/Badge';
import {
    ConstraintListItem,
    ConstraintsList,
} from 'component/common/ConstraintsList/ConstraintsList';
import { objectId } from 'utils/objectId';
import type { FC } from 'react';
import { SegmentExecution } from './SegmentExecution/SegmentExecution.tsx';
import { useStrategyParameters } from 'component/feature/FeatureView/FeatureOverview/FeatureOverviewEnvironments/FeatureOverviewEnvironment/EnvironmentAccordionBody/StrategyDraggableItem/StrategyItem/StrategyExecution/hooks/useStrategyParameters';
import { useStrategies } from 'hooks/api/getters/useStrategies/useStrategies';
import { useCustomStrategyParameters } from 'component/feature/FeatureView/FeatureOverview/FeatureOverviewEnvironments/FeatureOverviewEnvironment/EnvironmentAccordionBody/StrategyDraggableItem/StrategyItem/StrategyExecution/hooks/useCustomStrategyParameters';
import { RolloutVariants } from 'component/feature/FeatureView/FeatureOverview/FeatureOverviewEnvironments/FeatureOverviewEnvironment/EnvironmentAccordionBody/StrategyDraggableItem/StrategyItem/StrategyExecution/RolloutVariants/RolloutVariants';

type StrategyExecutionProps = {
    strategyResult: PlaygroundStrategySchema;
    percentageFill?: string;
    input?: PlaygroundRequestSchema;
};

export const PlaygroundStrategyExecution: FC<StrategyExecutionProps> = ({
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
        ...(hasSegments
            ? segments.map((segment) => (
                  <SegmentExecution
                      key={objectId(segment)}
                      segment={segment}
                      input={input}
                  />
              ))
            : []),
        ...(hasConstraints
            ? constraints.map((constraint) => (
                  <ConstraintExecution
                      key={objectId(constraint)}
                      constraint={constraint}
                      input={input}
                  />
              ))
            : []),
        hasExecutionParameters &&
            params.map((param, index) => (
                <ConstraintListItem key={index}>{param}</ConstraintListItem>
            )),
        isCustomStrategy &&
            customStrategyItems.map((param, index) => (
                <ConstraintListItem key={index}>{param}</ConstraintListItem>
            )),
        name === 'default' && (
            <StyledBoxSummary sx={{ width: '100%' }} key='default-on'>
                The standard strategy is <Badge color='success'>ON</Badge> for
                all users.
            </StyledBoxSummary>
        ),
    ].filter(Boolean);

    const { variant, variants } = strategyResult.result as unknown as Partial<{
        variant: PlaygroundFeatureSchemaVariant;
        variants: StrategyVariantSchema[];
    }>;

    return (
        <>
            <ConstraintsList>{items}</ConstraintsList>
            {variants?.length ? (
                <RolloutVariants variants={variants} selected={variant?.name} />
            ) : null}
        </>
    );
};
