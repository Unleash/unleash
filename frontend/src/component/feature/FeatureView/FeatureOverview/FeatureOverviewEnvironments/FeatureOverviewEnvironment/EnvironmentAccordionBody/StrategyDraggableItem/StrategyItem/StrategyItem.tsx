import type { DragEventHandler, FC, ReactNode } from 'react';
import type { IFeatureStrategy } from 'interfaces/strategy';
import { StrategyExecution } from './StrategyExecution/StrategyExecution';
import SplitPreviewSlider from 'component/feature/StrategyTypes/SplitPreviewSlider/SplitPreviewSlider';
import { Box } from '@mui/material';
import { StrategyItemContainer as NewStrategyItemContainer } from 'component/common/StrategyItemContainer/StrategyItemContainer';

type StrategyItemProps = {
    actions: ReactNode;
    strategy: IFeatureStrategy;
    onDragStart?: DragEventHandler<HTMLButtonElement>;
    onDragEnd?: DragEventHandler<HTMLButtonElement>;
};

export const StrategyItem: FC<StrategyItemProps> = ({
    strategy,
    onDragStart,
    onDragEnd,
    actions,
}) => {
    return (
        <NewStrategyItemContainer
            strategy={strategy}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            actions={actions}
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
        </NewStrategyItemContainer>
    );
};
