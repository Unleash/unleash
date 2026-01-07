import DragIndicator from '@mui/icons-material/DragIndicator';
import { styled } from '@mui/material';
import { ScreenReaderOnly } from 'component/common/ScreenReaderOnly/ScreenReaderOnly';
import type { FC } from 'react';

const DragButton = styled('button')(({ theme }) => ({
    padding: 0,
    cursor: 'grab',
    transition: 'background-color 0.2s ease-in-out',
    backgroundColor: 'inherit',
    border: 'none',
    borderRadius: theme.shape.borderRadiusMedium,
    color: theme.palette.text.secondary,
    ':hover, :focus-visible': {
        outline: 'none',
        '.draggable-hover-indicator': {
            background: theme.palette.table.headerHover,
        },
    },
}));

const DraggableContent = styled('span')(({ theme }) => ({
    paddingTop: theme.spacing(2),
    paddingInline: theme.spacing(0.5),
    display: 'block',
    height: '100%',
    width: '100%',
}));

const DraggableHoverIndicator = styled('span')(({ theme }) => ({
    display: 'block',
    paddingBlock: theme.spacing(0.75),
    borderRadius: theme.shape.borderRadiusMedium,
    '> svg': {
        verticalAlign: 'bottom',
    },
}));

type Props = {
    dragItemRef: React.RefObject<HTMLElement>;
};

export const MilestoneCardDragHandle: FC<Props> = ({ dragItemRef }) => {
    return (
        <DragButton tabIndex={-1} type='button'>
            <DraggableContent ref={dragItemRef}>
                <DraggableHoverIndicator className='draggable-hover-indicator'>
                    <DragIndicator aria-hidden />
                </DraggableHoverIndicator>
                <ScreenReaderOnly>Drag to reorder</ScreenReaderOnly>
            </DraggableContent>
        </DragButton>
    );
};
