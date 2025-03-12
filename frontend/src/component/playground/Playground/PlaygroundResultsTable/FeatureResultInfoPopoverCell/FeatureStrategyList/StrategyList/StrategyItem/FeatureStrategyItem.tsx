import { useTheme } from '@mui/material';
import { PlaygroundResultChip } from '../../../../PlaygroundResultChip/PlaygroundResultChip';
import type {
    PlaygroundStrategySchema,
    PlaygroundRequestSchema,
} from 'openapi';
import { StrategyExecution } from './StrategyExecution/StrategyExecution';
import { objectId } from 'utils/objectId';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { DisabledStrategyExecution } from './StrategyExecution/DisabledStrategyExecution';
import { StrategyItemContainer } from 'component/common/StrategyItemContainer/StrategyItemContainer';

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
            {/* todo: use new strategy execution components */}
            <ConditionallyRender
                condition={Boolean(strategy.disabled)}
                show={
                    <DisabledStrategyExecution
                        strategyResult={strategy}
                        input={input}
                    />
                }
                elseShow={
                    <StrategyExecution
                        strategyResult={strategy}
                        input={input}
                        percentageFill={theme.palette.background.elevation2}
                    />
                }
            />
        </StrategyItemContainer>
    );
};
