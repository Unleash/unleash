import type { FC } from 'react';
import type { FeatureStrategySchema } from 'openapi';
import type { ISegment } from 'interfaces/segment';
import { ConstraintAccordionView } from 'component/common/NewConstraintAccordion/ConstraintAccordionView/ConstraintAccordionView';
import { useStrategies } from 'hooks/api/getters/useStrategies/useStrategies';
import { objectId } from 'utils/objectId';
import { useCustomStrategyParameters } from './hooks/useCustomStrategyParameters.js';
import { useStrategyParameters } from './hooks/useStrategyParameters.js';
import { useSegmentsMap } from 'hooks/api/getters/useSegments/useSegmentsMap.ts';
import { SegmentItem } from 'component/common/SegmentItem/SegmentItem';
import {
    ConstraintListItem,
    ConstraintsList,
} from 'component/common/ConstraintsList/ConstraintsList';
import { RolloutVariants } from './RolloutVariants/RolloutVariants.tsx';

type StrategyExecutionProps = {
    strategy: FeatureStrategySchema;
    displayGroupId?: boolean;
};

export const StrategyExecution: FC<StrategyExecutionProps> = ({
    strategy,
    displayGroupId = false,
}) => {
    const { strategies } = useStrategies();
    const segmentsById = useSegmentsMap();
    const { isCustomStrategy, customStrategyParameters: customStrategyItems } =
        useCustomStrategyParameters(strategy, strategies);
    const strategyParameters = useStrategyParameters(strategy, displayGroupId);
    const { constraints } = strategy;
    const strategySegments = strategy.segments
        ?.map((id) => segmentsById.get(id))
        .filter((segment): segment is ISegment => Boolean(segment));

    return (
        <>
            <ConstraintsList>
                {strategySegments?.map((segment) => (
                    <SegmentItem segment={segment} key={segment.id} />
                ))}
                {constraints?.map((constraint, index) => (
                    <ConstraintAccordionView
                        key={`${objectId(constraint)}-${index}`}
                        constraint={constraint}
                    />
                ))}
                {(isCustomStrategy
                    ? customStrategyItems
                    : strategyParameters
                ).map((item, index) => (
                    <ConstraintListItem key={index}>{item}</ConstraintListItem>
                ))}
            </ConstraintsList>
            <RolloutVariants variants={strategy.variants} />
        </>
    );
};
