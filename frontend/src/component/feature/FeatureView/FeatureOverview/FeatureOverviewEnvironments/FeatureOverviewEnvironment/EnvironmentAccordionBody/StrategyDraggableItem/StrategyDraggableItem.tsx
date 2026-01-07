import {
    type DragEventHandler,
    type RefObject,
    useRef,
    type ReactNode,
} from 'react';
import { Box } from '@mui/material';
import type { IFeatureStrategy } from 'interfaces/strategy';
import { StrategyItem } from './StrategyItem/StrategyItem.tsx';

type StrategyDraggableItemProps = {
    headerItemsRight: ReactNode;
    strategy: IFeatureStrategy;
    index: number;
    isDragging?: boolean;
    onDragStartRef?: (
        ref: RefObject<HTMLDivElement>,
        index: number,
    ) => DragEventHandler<HTMLButtonElement>;
    onDragOver?: (
        ref: RefObject<HTMLDivElement>,
        index: number,
    ) => DragEventHandler<HTMLDivElement>;
    onDragEnd?: () => void;
};

export const StrategyDraggableItem = ({
    strategy,
    index,
    isDragging,
    onDragStartRef,
    onDragOver,
    onDragEnd,
    headerItemsRight,
}: StrategyDraggableItemProps) => {
    const ref = useRef<HTMLDivElement>(null);

    return (
        <Box
            key={strategy.id}
            ref={ref}
            onDragOver={onDragOver?.(ref, index)}
            sx={{ opacity: isDragging ? '0.5' : '1' }}
        >
            <StrategyItem
                headerItemsRight={headerItemsRight}
                strategy={strategy}
                onDragStart={onDragStartRef?.(ref, index)}
                onDragEnd={onDragEnd}
            />
        </Box>
    );
};
