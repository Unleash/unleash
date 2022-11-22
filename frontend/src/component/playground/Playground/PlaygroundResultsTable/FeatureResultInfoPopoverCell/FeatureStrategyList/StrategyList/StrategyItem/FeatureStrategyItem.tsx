import { useTheme } from '@mui/material';
import { PlaygroundResultChip } from '../../../../PlaygroundResultChip/PlaygroundResultChip';
import {
    PlaygroundStrategySchema,
    PlaygroundRequestSchema,
} from 'component/playground/Playground/interfaces/playground.model';
import { StrategyExecution } from './StrategyExecution/StrategyExecution';
import { useStyles } from './FeatureStrategyItem.styles';
import { StrategyItemContainer } from 'component/common/StrategyItemContainer/StrategyItemContainer';
import { objectId } from 'utils/objectId';

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
    const { classes: styles } = useStyles();
    const theme = useTheme();
    const label =
        result.evaluationStatus === 'incomplete'
            ? 'Unevaluated'
            : result.enabled
            ? 'True'
            : 'False';

    return (
        <StrategyItemContainer
            className={
                result.enabled && result.evaluationStatus === 'complete'
                    ? styles.successBorder
                    : undefined
            }
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
            <StrategyExecution
                strategyResult={strategy}
                input={input}
                percentageFill={theme.palette.tertiary.light}
            />
        </StrategyItemContainer>
    );
};
