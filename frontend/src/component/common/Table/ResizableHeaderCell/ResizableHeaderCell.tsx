import { type MouseEvent, useRef, useCallback } from 'react';
import { styled } from '@mui/material';
import { CellSortable } from '../SortableTableHeader/CellSortable/CellSortable.tsx';
import type { Header } from '@tanstack/react-table';
import { flexRender } from '@tanstack/react-table';

const ResizeHandle = styled('div')(({ theme }) => ({
    position: 'absolute',
    right: -3,
    top: 0,
    height: '100%',
    width: 6,
    cursor: 'col-resize',
    backgroundColor: 'transparent',
    borderRight: `3px solid transparent`,
    zIndex: 100, // Higher z-index to be above button
    transition: 'all 0.2s ease',
    '&:hover': {
        borderRight: `3px solid ${theme.palette.primary.main}`,
    },
    '&.is-resizing': {
        borderRight: `3px solid ${theme.palette.primary.main}`,
    },
    // Add a wider hover area for easier targeting
    '&::before': {
        content: '""',
        position: 'absolute',
        left: -3,
        right: -3,
        top: 0,
        height: '100%',
        cursor: 'col-resize',
    },
}));

const HeaderCellContainer = styled('div')({
    position: 'relative',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    overflow: 'visible', // Important for resize handle positioning
});

interface ResizableHeaderCellProps {
    header: Header<any, unknown>;
}

export const ResizableHeaderCell = ({ header }: ResizableHeaderCellProps) => {
    const column = header.column;
    const isDesc = column.getIsSorted() === 'desc';
    const align = column.columnDef.meta?.align || undefined;
    const width = column.getSize();
    const content = column.columnDef.header;
    const canResize = column.getCanResize();


    const resizeHandleRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = useCallback(
        (e: MouseEvent) => {
            if (!canResize) return;

            e.preventDefault();
            e.stopPropagation();

            const startX = e.clientX;
            const startWidth = column.getSize();
            const table = header.getContext().table;

            if (resizeHandleRef.current) {
                resizeHandleRef.current.classList.add('is-resizing');
            }
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';

            const handleMouseMove = (e: globalThis.MouseEvent) => {
                const deltaX = e.clientX - startX;
                const newWidth = Math.max(50, Math.max(column.columnDef.minSize || 50, startWidth + deltaX));
                const maxWidth = column.columnDef.maxSize;
                const finalWidth = maxWidth ? Math.min(newWidth, maxWidth) : newWidth;

                table.setColumnSizing((prev) => ({
                    ...prev,
                    [column.id]: finalWidth,
                }));
            };

            const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
                if (resizeHandleRef.current) {
                    resizeHandleRef.current.classList.remove('is-resizing');
                }
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        },
        [header, column, canResize],
    );

    const handleDoubleClick = useCallback(() => {
        if (!canResize) return;
        column.resetSize();
    }, [column, canResize]);

    return (
        <CellSortable
            isSortable={column.getCanSort()}
            isSorted={column.getIsSorted() !== false}
            isDescending={isDesc}
            align={align}
            onClick={(e) => {
                // Don't sort if clicking on resize handle area
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const isResizeArea = clickX > rect.width - 20; // 20px resize area

                if (!isResizeArea) {
                    column.toggleSorting();
                }
            }}
            styles={{
                borderRadius: '0px',
                paddingTop: 0,
                paddingBottom: 0,
                paddingLeft: 8,
                paddingRight: canResize ? 12 : 8, // Space for resize handle
                width: width,
                minWidth: 50,
                position: 'relative',
                overflow: 'visible',
            }}
            ariaTitle={typeof content === 'string' ? content : header.id}
        >
            <HeaderCellContainer>
                {header.isPlaceholder
                    ? null
                    : flexRender(content, header.getContext())}
                {canResize && (
                    <ResizeHandle
                        ref={resizeHandleRef}
                        onMouseDown={(e) => {
                            console.log('Resize handle mouse down for column:', column.id);
                            handleMouseDown(e);
                        }}
                        onDoubleClick={handleDoubleClick}
                        title={`Resize ${column.id} column`}
                        onClick={(e) => {
                            console.log('Resize handle clicked for column:', column.id);
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                        style={{
                            backgroundColor: 'rgba(255, 0, 0, 0.3)', // Temporary red background for visibility
                        }}
                    />
                )}
            </HeaderCellContainer>
        </CellSortable>
    );
};
