import { ConditionallyRender } from '../../../../../common/ConditionallyRender/ConditionallyRender';
import { StrategySeparator } from '../../../../../common/StrategySeparator/StrategySeparator';
import { styled, useTheme } from '@mui/material';
import { useStyles } from './PlaygroundResultFeatureStrategyItem.styles';
import {
    formatStrategyName,
    getFeatureStrategyIcon,
} from '../../../../../../utils/strategyNames';
import StringTruncator from '../../../../../common/StringTruncator/StringTruncator';
import { PlaygroundResultChip } from '../../PlaygroundResultChip/PlaygroundResultChip';
import { StrategyExecution } from '../../../../../feature/FeatureView/FeatureOverview/FeatureOverviewEnvironments/FeatureOverviewEnvironment/EnvironmentAccordionBody/StrategyDraggableItem/StrategyItem/StrategyExecution/StrategyExecution';
import { PlaygroundFeatureStrategyResult } from 'hooks/api/actions/usePlayground/playground.model';

interface IPlaygroundResultFeatureStrategyItemProps {
    strategy: PlaygroundFeatureStrategyResult;
    index: number;
}

const StyledStrategyResultBox = styled('div')(({ theme }) => ({
    width: '100%',
    position: 'relative',
    paddingBottom: '1rem',
    borderRadius: theme.shape.borderRadiusMedium,
    '& + &': {
        marginTop: theme.spacing(2),
    },
    background: theme.palette.background.default,
}));

export const PlaygroundResultFeatureStrategyItem = ({
    strategy,
    index,
}: IPlaygroundResultFeatureStrategyItemProps) => {
    const { result } = strategy;
    const { classes: styles } = useStyles();
    const theme = useTheme();
    const Icon = getFeatureStrategyIcon(strategy.name);
    const label =
        result === undefined ? 'Not found' : result ? 'True' : 'False';
    const border = Boolean(result)
        ? `2px solid ${theme.palette.success.main}`
        : `1px solid ${theme.palette.divider}`;

    return (
        <StyledStrategyResultBox key={strategy.id} sx={{ border }}>
            <ConditionallyRender
                condition={index > 0}
                show={<StrategySeparator text="OR" />}
            />
            <div className={styles.innerContainer}>
                <div className={styles.header}>
                    <div className={styles.headerName}>
                        <Icon className={styles.icon} />
                        <StringTruncator
                            maxWidth="150"
                            maxLength={15}
                            text={formatStrategyName(strategy.name)}
                        />
                    </div>
                    <PlaygroundResultChip
                        showIcon={false}
                        enabled={Boolean(result)}
                        label={label}
                    />
                </div>
                <div className={styles.body}>
                    <StrategyExecution
                        strategy={strategy}
                        percentageFill={theme.palette.grey[200]}
                    />
                </div>
            </div>
        </StyledStrategyResultBox>
    );
};
