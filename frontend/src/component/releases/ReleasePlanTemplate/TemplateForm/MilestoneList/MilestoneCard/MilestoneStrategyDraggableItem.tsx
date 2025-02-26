import type { IReleasePlanMilestoneStrategy } from 'interfaces/releasePlans';
import { type DragEventHandler, type RefObject, useRef } from 'react';
import { Box, IconButton } from '@mui/material';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/DeleteOutlined';
import { StrategySeparator } from 'component/common/StrategySeparator/LegacyStrategySeparator';
import { MilestoneStrategyItem } from './MilestoneStrategyItem';

interface IMilestoneStrategyDraggableItemProps {
    strategy: Omit<IReleasePlanMilestoneStrategy, 'milestoneId'>;
    index: number;
    isDragging?: boolean;
    onDragStartRef: (
        ref: RefObject<HTMLDivElement>,
        index: number,
    ) => DragEventHandler<HTMLButtonElement>;
    onDragOver: (
        ref: RefObject<HTMLDivElement>,
        index: number,
    ) => DragEventHandler<HTMLDivElement>;
    onDragEnd: () => void;
    onDeleteClick: () => void;
    onEditClick: () => void;
}

export const MilestoneStrategyDraggableItem = ({
    strategy,
    index,
    isDragging,
    onDragStartRef,
    onDragOver,
    onDragEnd,
    onDeleteClick,
    onEditClick,
}: IMilestoneStrategyDraggableItemProps) => {
    const ref = useRef<HTMLDivElement>(null);
    return (
        <Box
            key={strategy.id}
            ref={ref}
            onDragOver={onDragOver(ref, index)}
            sx={{ opacity: isDragging ? '0.5' : '1' }}
        >
            {index > 0 && <StrategySeparator text='OR' />}
            <MilestoneStrategyItem
                strategy={strategy}
                onDragStart={onDragStartRef(ref, index)}
                onDragEnd={onDragEnd}
                actions={
                    <>
                        <IconButton title='Edit strategy' onClick={onEditClick}>
                            <Edit />
                        </IconButton>
                        <IconButton
                            title='Remove release plan'
                            onClick={onDeleteClick}
                        >
                            <Delete />
                        </IconButton>
                    </>
                }
            />
        </Box>
    );
};
