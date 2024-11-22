import { Box, styled } from '@mui/material';
import { StrategyExecution } from '../FeatureOverviewEnvironments/FeatureOverviewEnvironment/EnvironmentAccordionBody/StrategyDraggableItem/StrategyItem/StrategyExecution/StrategyExecution';
import SplitPreviewSlider from 'component/feature/StrategyTypes/SplitPreviewSlider/SplitPreviewSlider';
import {
    formatStrategyName,
    getFeatureStrategyIcon,
} from 'utils/strategyNames';
import type { IFeatureStrategy } from 'interfaces/strategy';

const StyledStrategy = styled('div')(({ theme }) => ({
    background: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusMedium,
    padding: theme.spacing(2),
}));

const StyledHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    alignItems: 'center',
    color: theme.palette.text.primary,
    '& > svg': {
        fill: theme.palette.action.disabled,
    },
    marginBottom: theme.spacing(1),
}));

interface IReleasePlanMilestoneStrategyProps {
    strategy: IFeatureStrategy;
}

export const ReleasePlanMilestoneStrategy = ({
    strategy,
}: IReleasePlanMilestoneStrategyProps) => {
    const Icon = getFeatureStrategyIcon(strategy.strategyName);

    return (
        <StyledStrategy>
            <StyledHeader>
                <Icon />
                {`${formatStrategyName(String(strategy.strategyName))}${strategy.title ? `: ${strategy.title}` : ''}`}
            </StyledHeader>
            <StrategyExecution strategy={strategy} />
            {strategy.variants &&
                strategy.variants.length > 0 &&
                (strategy.disabled ? (
                    <Box sx={{ opacity: '0.5' }}>
                        <SplitPreviewSlider variants={strategy.variants} />
                    </Box>
                ) : (
                    <SplitPreviewSlider variants={strategy.variants} />
                ))}
        </StyledStrategy>
    );
};
