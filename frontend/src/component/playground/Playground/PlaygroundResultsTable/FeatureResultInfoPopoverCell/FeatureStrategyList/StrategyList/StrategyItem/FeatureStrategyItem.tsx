import { PlaygroundResultChip } from '../../../../PlaygroundResultChip/PlaygroundResultChip';
import type {
    PlaygroundStrategySchema,
    PlaygroundRequestSchema,
} from 'openapi';
import { objectId } from 'utils/objectId';
import { StrategyItemContainer } from 'component/common/StrategyItemContainer/StrategyItemContainer';
import { StrategyExecution } from './StrategyExecution/StrategyExecution';

interface IFeatureStrategyItemProps {
    strategy: PlaygroundStrategySchema;
    input?: PlaygroundRequestSchema;
    className?: string;
}

export const FeatureStrategyItem = ({
    strategy,
    input,
    className,
}: IFeatureStrategyItemProps) => {
    const { result } = strategy;
    const label =
        result.evaluationStatus === 'incomplete' ||
        result.evaluationStatus === 'unevaluated'
            ? 'Not evaluated'
            : result.enabled
              ? 'True'
              : 'False';

    return (
        <StrategyItemContainer
            strategy={{ ...strategy, id: `${objectId(strategy)}` }}
            strategyHeaderLevel={4}
            className={className}
            headerItemsLeft={
                strategy.disabled ? null : (
                    <PlaygroundResultChip
                        showIcon={false}
                        enabled={result.enabled}
                        label={label}
                    />
                )
            }
        >
            <StrategyExecution strategyResult={strategy} input={input} />
        </StrategyItemContainer>
    );
};
