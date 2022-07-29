import { Box, useTheme } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { StrategySeparator } from 'component/common/StrategySeparator/StrategySeparator';
import {
    formatStrategyName,
    getFeatureStrategyIcon,
} from 'utils/strategyNames';
import StringTruncator from 'component/common/StringTruncator/StringTruncator';
import { PlaygroundResultChip } from '../../PlaygroundResultChip/PlaygroundResultChip';
import { PlaygroundFeatureStrategyResult } from 'hooks/api/actions/usePlayground/playground.model';
import { PlaygroundResultStrategyExecution } from '../PlaygroundResultStrategyExecution/PlaygroundResultStrategyExecution';
import { useStyles } from './PlaygroundResultFeatureStrategyItem.styles';

interface IPlaygroundResultFeatureStrategyItemProps {
    strategy: PlaygroundFeatureStrategyResult;
    index: number;
}

export const PlaygroundResultFeatureStrategyItem = ({
    strategy,
    index,
}: IPlaygroundResultFeatureStrategyItemProps) => {
    const { result, name } = strategy;
    const { classes: styles } = useStyles();
    const theme = useTheme();
    const Icon = getFeatureStrategyIcon(strategy.name);
    const label =
        result === undefined ? 'Not found' : result ? 'True' : 'False';
    const border = Boolean(result)
        ? `1px solid ${theme.palette.success.main}`
        : `1px solid ${theme.palette.divider}`;

    return (
        <Box key={strategy.id} sx={{ width: '100%', position: 'relative' }}>
            <ConditionallyRender
                condition={index > 0}
                show={<StrategySeparator text="OR" />}
            />
            <Box className={styles.innerContainer} sx={{ border }}>
                <div className={styles.header}>
                    <div className={styles.headerName}>
                        <Icon className={styles.icon} />
                        <StringTruncator
                            maxWidth="150"
                            maxLength={15}
                            text={formatStrategyName(name)}
                        />
                    </div>
                    <PlaygroundResultChip
                        showIcon={false}
                        enabled={Boolean(result)}
                        label={label}
                    />
                </div>
                <div className={styles.body}>
                    <PlaygroundResultStrategyExecution
                        strategyResult={strategy}
                        percentageFill={theme.palette.tertiary.light}
                    />
                </div>
            </Box>
        </Box>
    );
};
