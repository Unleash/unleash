import { Box, IconButton, styled } from '@mui/material';
import SplitPreviewSlider from 'component/feature/StrategyTypes/SplitPreviewSlider/SplitPreviewSlider';
import {
    formatStrategyName,
    getFeatureStrategyIcon,
} from 'utils/strategyNames';
import type { IFeatureStrategy } from 'interfaces/strategy';
import { StrategyExecution } from 'component/feature/FeatureView/FeatureOverview/FeatureOverviewEnvironments/FeatureOverviewEnvironment/EnvironmentAccordionBody/StrategyDraggableItem/StrategyItem/StrategyExecution/StrategyExecution';
import type { DragEventHandler, ReactNode } from 'react';
import DragIndicator from '@mui/icons-material/DragIndicator';

const StyledStrategy = styled('div')(({ theme }) => ({
    background: theme.palette.background.paper,
}));

const DragIcon = styled(IconButton)({
    padding: 0,
    cursor: 'inherit',
    transition: 'color 0.2s ease-in-out',
});

const StyledHeader = styled('div', {
    shouldForwardProp: (prop) => prop !== 'draggable',
})<{ draggable: boolean }>(({ theme, draggable }) => ({
    display: 'flex',
    padding: theme.spacing(2),
    gap: theme.spacing(1),
    alignItems: 'center',
    color: theme.palette.text.primary,
    '& > svg': {
        fill: theme.palette.action.disabled,
    },
    borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledStrategyExecution = styled('div')(({ theme }) => ({
    padding: theme.spacing(2),
}));

interface IReleasePlanMilestoneStrategyProps {
    strategy: IFeatureStrategy;
    onDragStart?: DragEventHandler<HTMLButtonElement>;
    onDragEnd?: DragEventHandler<HTMLButtonElement>;
    actions?: ReactNode;
}

export const MilestoneStrategyItem = ({
    strategy,
    onDragStart,
    onDragEnd,
    actions,
}: IReleasePlanMilestoneStrategyProps) => {
    const Icon = getFeatureStrategyIcon(strategy.strategyName);

    return (
        <StyledStrategy>
            <StyledHeader draggable={Boolean(onDragStart)}>
                <DragIcon
                    draggable
                    disableRipple
                    size='small'
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    sx={{ cursor: 'move' }}
                >
                    <DragIndicator
                        titleAccess='Drag to reorder'
                        cursor='grab'
                        sx={{ color: 'action.active' }}
                    />
                </DragIcon>
                <Icon />
                {`${formatStrategyName(String(strategy.strategyName))}${strategy.title ? `: ${strategy.title}` : ''}`}
                <Box
                    sx={{
                        marginLeft: 'auto',
                        display: 'flex',
                        minHeight: (theme) => theme.spacing(6),
                        alignItems: 'center',
                    }}
                >
                    {actions}
                </Box>
            </StyledHeader>
            <StyledStrategyExecution>
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
            </StyledStrategyExecution>
        </StyledStrategy>
    );
};
