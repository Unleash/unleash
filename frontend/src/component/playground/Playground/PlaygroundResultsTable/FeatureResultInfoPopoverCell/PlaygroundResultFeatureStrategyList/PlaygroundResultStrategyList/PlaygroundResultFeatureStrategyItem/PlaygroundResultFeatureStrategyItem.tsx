import { useTheme } from '@mui/material';
import { PlaygroundResultChip } from '../../../../PlaygroundResultChip/PlaygroundResultChip';
import {
    PlaygroundStrategySchema,
    PlaygroundRequestSchema,
} from 'hooks/api/actions/usePlayground/playground.model';
import { PlaygroundResultStrategyExecution } from './PlaygroundResultStrategyExecution/PlaygroundResultStrategyExecution';
import { useStyles } from './PlaygroundResultFeatureStrategyItem.styles';
import { StrategyItemContainer } from 'component/common/StrategyItemContainer/StrategyItemContainer';
import { objectId } from 'utils/objectId';

interface IPlaygroundResultFeatureStrategyItemProps {
    strategy: PlaygroundStrategySchema;
    index: number;
    input?: PlaygroundRequestSchema;
    compact: boolean;
}

export const PlaygroundResultFeatureStrategyItem = ({
    strategy,
    input,
    index,
    compact,
}: IPlaygroundResultFeatureStrategyItemProps) => {
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
                    size={
                        result.evaluationStatus === 'incomplete'
                            ? 'large'
                            : 'default'
                    }
                />
            }
        >
            <PlaygroundResultStrategyExecution
                strategyResult={strategy}
                input={input}
                percentageFill={theme.palette.tertiary.light}
            />
        </StrategyItemContainer>
    );
};
