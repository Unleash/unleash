import type { FC } from 'react';
import { styled } from '@mui/material';
import type { CreateFeatureStrategySchema } from 'openapi';
import type { IFeatureStrategyPayload } from 'interfaces/strategy';
import { useUiFlag } from 'hooks/useUiFlag';
import { StrategyExecution as LegacyStrategyExecution } from './LegacyStrategyExecution';
import { ConstraintItem } from 'component/common/ConstraintsList/ConstraintItem/ConstraintItem';
import { useStrategies } from 'hooks/api/getters/useStrategies/useStrategies';
import { objectId } from 'utils/objectId';
import { useCustomStrategyParameters } from './hooks/useCustomStrategyParameters';
import { useStrategyParameters } from './hooks/useStrategyParameters';
import { useSegments } from 'hooks/api/getters/useSegments/useSegments';
import { SegmentItem } from 'component/common/SegmentItem/SegmentItem';
import { ConstraintsList } from 'component/common/ConstraintsList/ConstraintsList';

const FilterContainer = styled('div', {
    shouldForwardProp: (prop) => prop !== 'grayscale',
})<{ grayscale: boolean }>(({ grayscale }) =>
    grayscale ? { filter: 'grayscale(1)', opacity: 0.67 } : {},
);

type StrategyExecutionProps = {
    strategy: IFeatureStrategyPayload | CreateFeatureStrategySchema;
    displayGroupId?: boolean;
};

export const StrategyExecution: FC<StrategyExecutionProps> = ({
    strategy,
    displayGroupId = false,
}) => {
    const { strategies } = useStrategies();
    const { segments } = useSegments();
    const { isCustomStrategy, customStrategyParameters: customStrategyItems } =
        useCustomStrategyParameters(strategy, strategies);
    const strategyParameters = useStrategyParameters(strategy, displayGroupId);
    const { constraints } = strategy;
    const strategySegments = segments?.filter((segment) =>
        strategy.segments?.includes(segment.id),
    );
    const flagOverviewRedesign = useUiFlag('flagOverviewRedesign');

    if (!flagOverviewRedesign) {
        return (
            <LegacyStrategyExecution
                strategy={strategy}
                displayGroupId={displayGroupId}
            />
        );
    }

    return (
        <FilterContainer grayscale={strategy.disabled === true}>
            <ConstraintsList>
                {strategySegments?.map((segment) => (
                    <SegmentItem segment={segment} />
                ))}
                {constraints?.map((constraint, index) => (
                    <ConstraintItem
                        key={`${objectId(constraint)}-${index}`}
                        {...constraint}
                    />
                ))}
                {isCustomStrategy ? customStrategyItems : strategyParameters}
            </ConstraintsList>
        </FilterContainer>
    );
};
