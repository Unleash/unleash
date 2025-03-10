import type { DragEventHandler, FC, ReactNode } from 'react';
import type { IFeatureStrategy } from 'interfaces/strategy';
import { StrategyExecution } from './StrategyExecution/StrategyExecution';
import SplitPreviewSlider from 'component/feature/StrategyTypes/SplitPreviewSlider/SplitPreviewSlider';
import { Box } from '@mui/material';
import { StrategyItemContainer } from 'component/common/StrategyItemContainer/StrategyItemContainer';

type StrategyItemProps = {
    headerItemsRight?: ReactNode;
    strategy: Omit<IFeatureStrategy, 'id'>;
    onDragStart?: DragEventHandler<HTMLButtonElement>;
    onDragEnd?: DragEventHandler<HTMLButtonElement>;
    strategyHeaderLevel?: 1 | 2 | 3 | 4 | 5 | 6;
    description?: string;
};

export const StrategyItem: FC<StrategyItemProps> = ({
    strategy,
    onDragStart,
    onDragEnd,
    headerItemsRight,
    strategyHeaderLevel,
    description,
}) => {
    return (
        <StrategyItemContainer
            strategyHeaderLevel={strategyHeaderLevel}
            strategy={strategy}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            headerItemsRight={headerItemsRight}
            description={description}
        >
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
        </StrategyItemContainer>
    );
};
