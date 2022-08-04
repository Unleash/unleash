import { Box, styled, Typography, useTheme } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { StrategySeparator } from 'component/common/StrategySeparator/StrategySeparator';
import {
    formatStrategyName,
    getFeatureStrategyIcon,
} from 'utils/strategyNames';
import StringTruncator from 'component/common/StringTruncator/StringTruncator';
import { PlaygroundResultChip } from '../../../../PlaygroundResultChip/PlaygroundResultChip';
import {
    PlaygroundStrategySchema,
    PlaygroundRequestSchema,
} from 'hooks/api/actions/usePlayground/playground.model';
import { PlaygroundResultStrategyExecution } from './PlaygroundResultStrategyExecution/PlaygroundResultStrategyExecution';
import { useStyles } from './PlaygroundResultFeatureStrategyItem.styles';

interface IPlaygroundResultFeatureStrategyItemProps {
    strategy: PlaygroundStrategySchema;
    index: number;
    input?: PlaygroundRequestSchema;
    compact: boolean;
}

const StyledItemWrapper = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    margin: theme.spacing(0.5),
    gap: theme.spacing(1),
}));

export const PlaygroundResultFeatureStrategyItem = ({
    strategy,
    input,
    index,
    compact,
}: IPlaygroundResultFeatureStrategyItemProps) => {
    const { result, name } = strategy;
    const { classes: styles } = useStyles();
    const theme = useTheme();
    const Icon = getFeatureStrategyIcon(strategy.name);
    const label =
        result.evaluationStatus === 'incomplete'
            ? 'Unknown'
            : result.enabled
            ? 'True'
            : 'False';
    const border =
        result.enabled && result.evaluationStatus === 'complete'
            ? `1px solid ${theme.palette.success.main}`
            : `1px solid ${theme.palette.divider}`;

    return (
        <Box
            sx={{
                width: '100%',
                position: 'relative',
                paddingRight: compact ? '12px' : 0,
                ml: '-12px',
            }}
        >
            <ConditionallyRender
                condition={index > 0}
                show={<StrategySeparator text="OR" />}
            />
            <StyledItemWrapper sx={{ mr: 2 }}>
                <Typography
                    variant={'subtitle1'}
                    color={'text.secondary'}
                    sx={{ ml: 1 }}
                >
                    {index + 1}
                </Typography>
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
                            enabled={result.enabled}
                            label={label}
                            size={
                                result.evaluationStatus === 'incomplete'
                                    ? 'medium'
                                    : 'default'
                            }
                        />
                    </div>
                    <div className={styles.body}>
                        <PlaygroundResultStrategyExecution
                            strategyResult={strategy}
                            input={input}
                            percentageFill={theme.palette.tertiary.light}
                        />
                    </div>
                </Box>
            </StyledItemWrapper>
        </Box>
    );
};
