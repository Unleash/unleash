import { TableBody, TableRow, TableHead } from '@mui/material';
import { useRef, useCallback, useState, useEffect } from 'react';
import { Table } from 'component/common/Table/Table/Table';
import {
    type Header,
    type Table as TableType,
    flexRender,
} from '@tanstack/react-table';
import { TableCell } from '../TableCell/TableCell.tsx';
import { CellSortable } from '../SortableTableHeader/CellSortable/CellSortable.tsx';
import { StickyPaginationBar } from 'component/common/Table/StickyPaginationBar/StickyPaginationBar';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { styled } from '@mui/material';
import { useUiFlag } from 'hooks/useUiFlag';

const HeaderCell = <T extends object>(header: Header<T, unknown>) => {
    const column = header.column;
    const isDesc = column.getIsSorted() === 'desc';
    const align = column.columnDef.meta?.align || undefined;
    const width = column.getSize(); // Use getSize() for dynamic sizing
    const content = column.columnDef.header;

    return (
        <CellSortable
            isSortable={column.getCanSort()}
            isSorted={column.getIsSorted() !== false}
            isDescending={isDesc}
            align={align}
            onClick={() => column.toggleSorting()}
            styles={{
                borderRadius: '0px',
                paddingTop: 0,
                paddingBottom: 0,
                width: width,
                minWidth: 50,
            }}
            ariaTitle={typeof content === 'string' ? content : header.id}
        >
            {header.isPlaceholder
                ? null
                : flexRender(content, header.getContext())}
        </CellSortable>
    );
};

const TableContainer = styled('div')(({ theme }) => ({
    overflowX: 'auto',
    isolation: 'isolate',
    position: 'relative',
}));

const ResizeHandleOverlay = styled('div')(({ theme }) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '56px', // Height of table header
    pointerEvents: 'none',
    zIndex: 1000,
}));

const ColumnResizeHandle = styled('div')<{ left: number }>(({ theme, left }) => ({
    position: 'absolute',
    left: left - 3,
    top: 0,
    width: 6,
    height: '100%',
    cursor: 'col-resize',
    pointerEvents: 'auto',
    backgroundColor: 'transparent',
    borderRight: `2px solid transparent`,
    zIndex: 1001,
    '&:hover': {
        borderRight: `2px solid ${theme.palette.primary.main}`,
        backgroundColor: 'rgba(25, 118, 210, 0.1)',
    },
    '&.is-resizing': {
        borderRight: `2px solid ${theme.palette.primary.main}`,
        backgroundColor: 'rgba(25, 118, 210, 0.2)',
    },
    // Wider click area
    '&::before': {
        content: '""',
        position: 'absolute',
        left: -3,
        right: -3,
        top: 0,
        height: '100%',
    },
}));


/**
 * Use with react-table v8
 */
export const PaginatedTable = <T extends object>({
    totalItems,
    tableInstance,
}: {
    tableInstance: TableType<T>;
    totalItems?: number;
}) => {
    const { pagination } = tableInstance.getState();
    const tableRef = useRef<HTMLDivElement>(null);
    const [resizingColumn, setResizingColumn] = useState<string | null>(null);
    const resizableColumnsEnabled = useUiFlag('resizableColumns');

    // Calculate column positions for resize handles
    const getColumnPositions = useCallback(() => {
        if (!tableRef.current) return [];

        const headerCells = tableRef.current.querySelectorAll('thead th');
        const positions: Array<{ columnId: string; left: number; canResize: boolean }> = [];
        let currentLeft = 0;

        headerCells.forEach((cell, index) => {
            const header = tableInstance.getHeaderGroups()[0]?.headers[index];
            if (header) {
                const width = header.column.getSize();
                currentLeft += width;

                // Only add resize handle if this column can be resized, it's not the last column, and the feature is enabled
                if (resizableColumnsEnabled && header.column.getCanResize() && index < headerCells.length - 1) {
                    positions.push({
                        columnId: header.column.id,
                        left: currentLeft,
                        canResize: true,
                    });
                }
            }
        });

        return positions;
    }, [tableInstance]);

    const [columnPositions, setColumnPositions] = useState(getColumnPositions());

    // Update positions when column sizes change
    useEffect(() => {
        setColumnPositions(getColumnPositions());
    }, [getColumnPositions, tableInstance.getState().columnSizing]);

    const handleResizeStart = useCallback((columnId: string, startX: number) => {
        setResizingColumn(columnId);
        const column = tableInstance.getColumn(columnId);
        if (!column) return;

        const startWidth = column.getSize();
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';

        const handleMouseMove = (e: globalThis.MouseEvent) => {
            const deltaX = e.clientX - startX;
            const newWidth = Math.max(50, Math.max(column.columnDef.minSize || 50, startWidth + deltaX));
            const maxWidth = column.columnDef.maxSize;
            const finalWidth = maxWidth ? Math.min(newWidth, maxWidth) : newWidth;

            tableInstance.setColumnSizing((prev) => ({
                ...prev,
                [columnId]: finalWidth,
            }));
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            setResizingColumn(null);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, [tableInstance]);

    const scrollToTopIfNeeded = () => {
        if (!tableRef.current) return;

        const rect = tableRef.current.getBoundingClientRect();
        const isTableTopVisible = rect.top >= 0;

        if (!isTableTopVisible) {
            tableRef.current.scrollIntoView({ block: 'start' });
        }
    };

    return (
        <>
            <TableContainer ref={tableRef}>
                {/* Resize handle overlay - only render if feature is enabled */}
                {resizableColumnsEnabled && (
                    <ResizeHandleOverlay>
                        {columnPositions.map(({ columnId, left }) => (
                            <ColumnResizeHandle
                                key={columnId}
                                left={left}
                                className={`column-resize-handle ${resizingColumn === columnId ? 'is-resizing' : ''}`}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleResizeStart(columnId, e.clientX);
                                }}
                                onDoubleClick={() => {
                                    const column = tableInstance.getColumn(columnId);
                                    column?.resetSize();
                                }}
                                title={`Resize ${columnId} column`}
                            />
                        ))}
                    </ResizeHandleOverlay>
                )}
                <Table>
                    <TableHead>
                        {tableInstance.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    // Apply the same width to header cells
                                    const cellWidth = header.column.getSize();
                                    return (
                                        <th
                                            key={header.id}
                                            style={{
                                                width: cellWidth,
                                                minWidth: 50,
                                                maxWidth: cellWidth,
                                                padding: 0,
                                            }}
                                        >
                                            <HeaderCell {...header} />
                                        </th>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHead>
                    <TableBody
                        role='rowgroup'
                        sx={{
                            '& tr': {
                                '&:hover': {
                                    '.show-row-hover': {
                                        opacity: 1,
                                    },
                                },
                            },
                        }}
                    >
                        {tableInstance.getRowModel().rows.map((row) => (
                            <TableRow key={row.id}>
                                {row.getVisibleCells().map((cell) => {
                                    const cellWidth = cell.column.getSize();
                                    return (
                                        <TableCell
                                            key={cell.id}
                                            style={{
                                                width: cellWidth,
                                                minWidth: 50,
                                                maxWidth: cellWidth,
                                            }}
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <ConditionallyRender
                condition={
                    tableInstance.getRowModel().rows.length > 0 &&
                    (totalItems || 0) > 25
                }
                show={
                    <StickyPaginationBar
                        totalItems={totalItems}
                        pageIndex={pagination.pageIndex}
                        pageSize={pagination.pageSize}
                        fetchNextPage={() => {
                            tableInstance.setPagination({
                                pageIndex: pagination.pageIndex + 1,
                                pageSize: pagination.pageSize,
                            });
                            scrollToTopIfNeeded();
                        }}
                        fetchPrevPage={() => {
                            tableInstance.setPagination({
                                pageIndex: pagination.pageIndex - 1,
                                pageSize: pagination.pageSize,
                            });
                            scrollToTopIfNeeded();
                        }}
                        setPageLimit={(pageSize) => {
                            tableInstance.setPagination({
                                pageIndex: 0,
                                pageSize,
                            });

                            if (
                                pagination.pageIndex > 0 ||
                                pagination.pageSize > pageSize
                            ) {
                                // scroll to table top unless you are on the
                                // first page and increasing the page size.
                                scrollToTopIfNeeded();
                            }
                        }}
                    />
                }
            />
        </>
    );
};
