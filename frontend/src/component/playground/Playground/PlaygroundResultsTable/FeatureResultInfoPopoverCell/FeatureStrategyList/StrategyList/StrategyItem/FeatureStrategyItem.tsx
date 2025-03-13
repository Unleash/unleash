import { useTheme } from '@mui/material';
import { PlaygroundResultChip } from '../../../../PlaygroundResultChip/PlaygroundResultChip';
import type {
    PlaygroundStrategySchema,
    PlaygroundRequestSchema,
} from 'openapi';
import { objectId } from 'utils/objectId';
import { StrategyItemContainer } from 'component/common/StrategyItemContainer/StrategyItemContainer';
import { StrategyExecution } from 'component/feature/FeatureView/FeatureOverview/FeatureOverviewEnvironments/FeatureOverviewEnvironment/EnvironmentAccordionBody/StrategyDraggableItem/StrategyItem/StrategyExecution/StrategyExecution';

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
    const theme = useTheme();
    const label =
        result.evaluationStatus === 'incomplete' ||
        result.evaluationStatus === 'unevaluated'
            ? 'Unevaluated'
            : result.enabled
              ? 'True'
              : 'False';

    return (
        <StrategyItemContainer
            strategy={{ ...strategy, id: `${objectId(strategy)}` }}
            strategyHeaderLevel={4}
            className={className}
            headerItemsLeft={
                <PlaygroundResultChip
                    tabindex={-1}
                    showIcon={false}
                    enabled={result.enabled}
                    label={label}
                />
            }
        >
            <StrategyExecution strategy={strategy} input={input} />
        </StrategyItemContainer>
    );
};
