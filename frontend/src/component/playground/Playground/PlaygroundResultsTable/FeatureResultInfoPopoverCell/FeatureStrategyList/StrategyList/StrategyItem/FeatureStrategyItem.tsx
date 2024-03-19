import { useTheme } from '@mui/material';
import { PlaygroundResultChip } from '../../../../PlaygroundResultChip/PlaygroundResultChip';
import type {
    PlaygroundStrategySchema,
    PlaygroundRequestSchema,
} from 'openapi';
import { StrategyExecution } from './StrategyExecution/StrategyExecution';
import { StrategyItemContainer } from 'component/common/StrategyItemContainer/StrategyItemContainer';
import { objectId } from 'utils/objectId';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { DisabledStrategyExecution } from './StrategyExecution/DisabledStrategyExecution';

interface IFeatureStrategyItemProps {
    strategy: PlaygroundStrategySchema;
    index: number;
    input?: PlaygroundRequestSchema;
}

export const FeatureStrategyItem = ({
    strategy,
    input,
    index,
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
            style={{
                borderColor:
                    result.enabled && result.evaluationStatus === 'complete'
                        ? theme.palette.success.main
                        : 'none',
            }}
            strategy={{ ...strategy, id: `${objectId(strategy)}` }}
            orderNumber={index + 1}
            actions={
                <PlaygroundResultChip
                    showIcon={false}
                    enabled={result.enabled}
                    label={label}
                />
            }
        >
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
