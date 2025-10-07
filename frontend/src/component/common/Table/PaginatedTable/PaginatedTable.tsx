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

const HeaderCell = <T extends object>(
    header: Header<T, unknown>,
    enableResizing: boolean,
) => {
    const column = header.column;
    const isDesc = column.getIsSorted() === 'desc';
    const align = column.columnDef.meta?.align || undefined;
    const width = enableResizing
        ? column.getSize()
        : column.columnDef.meta?.width || undefined;
    const fixedWidth = width && typeof width === 'number' ? width : undefined;
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
                width,
                maxWidth: fixedWidth,
                minWidth: enableResizing ? 50 : fixedWidth,
            }}
            ariaTitle={typeof content === 'string' ? content : undefined}
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

const ResizableTable = styled(Table)({
    tableLayout: 'fixed',
    width: '100%',
});

const ResizeHandleOverlay = styled('div')(({ theme }) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '56px',
    pointerEvents: 'none',
    zIndex: 1000,
}));

const ColumnResizeHandle = styled('div')<{ left: number }>(
    ({ theme, left }) => ({
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
        '&::before': {
            content: '""',
            position: 'absolute',
            left: -3,
            right: -3,
            top: 0,
            height: '100%',
        },
    }),
);

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
    const enableResizing = tableInstance.options.enableColumnResizing || false;

    const getColumnPositions = useCallback(() => {
        if (!tableRef.current || !enableResizing) {
            console.log(
                'Early return - tableRef.current:',
                !!tableRef.current,
                'enableResizing:',
                enableResizing,
            );
            return [];
        }

        const headerCells = tableRef.current.querySelectorAll('thead th');
        console.log('Found header cells:', headerCells.length);
        const positions: Array<{ columnId: string; left: number }> = [];
        let currentLeft = 0;

        headerCells.forEach((cell, index) => {
            const header = tableInstance.getHeaderGroups()[0]?.headers[index];
            if (header) {
                const width = header.column.getSize();
                currentLeft += width;

                const canResize = header.column.getCanResize();
                const isNotLast = index < headerCells.length - 1;
                console.log(
                    `Column ${header.column.id}: canResize=${canResize}, isNotLast=${isNotLast}, width=${width}`,
                );

                if (canResize && isNotLast) {
                    positions.push({
                        columnId: header.column.id,
                        left: currentLeft,
                    });
                }
            }
        });

        console.log('Final positions:', positions);
        return positions;
    }, [tableInstance, enableResizing]);

    const [columnPositions, setColumnPositions] = useState(
        getColumnPositions(),
    );

    useEffect(() => {
        if (enableResizing) {
            const positions = getColumnPositions();
            console.log('Column positions:', positions);
            setColumnPositions(positions);
        }
    }, [
        getColumnPositions,
        enableResizing,
        tableInstance.getState().columnSizing,
    ]);

    const handleResizeStart = useCallback(
        (columnId: string, startX: number) => {
            setResizingColumn(columnId);
            const column = tableInstance.getColumn(columnId);
            if (!column) return;

            const startWidth = column.getSize();
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';

            const handleMouseMove = (e: globalThis.MouseEvent) => {
                const deltaX = e.clientX - startX;
                const newWidth = Math.max(50, startWidth + deltaX);
                const maxWidth = column.columnDef.maxSize;
                const minWidth = column.columnDef.minSize || 50;
                const finalWidth = maxWidth
                    ? Math.min(Math.max(newWidth, minWidth), maxWidth)
                    : Math.max(newWidth, minWidth);

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
        },
        [tableInstance],
    );

    const scrollToTopIfNeeded = () => {
        if (!tableRef.current) return;

        const rect = tableRef.current.getBoundingClientRect();
        const isTableTopVisible = rect.top >= 0;

        if (!isTableTopVisible) {
            tableRef.current.scrollIntoView({ block: 'start' });
        }
    };

    const TableComponent = enableResizing ? ResizableTable : Table;

    console.log(
        'PaginatedTable render - enableResizing:',
        enableResizing,
        'columnPositions:',
        columnPositions,
    );

    return (
        <>
            <TableContainer ref={tableRef}>
                {enableResizing && (
                    <ResizeHandleOverlay>
                        {columnPositions.map(({ columnId, left }) => (
                            <ColumnResizeHandle
                                key={columnId}
                                left={left}
                                className={
                                    resizingColumn === columnId
                                        ? 'is-resizing'
                                        : ''
                                }
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleResizeStart(columnId, e.clientX);
                                }}
                                onDoubleClick={() => {
                                    const column =
                                        tableInstance.getColumn(columnId);
                                    column?.resetSize();
                                }}
                                title={`Resize ${columnId} column`}
                            />
                        ))}
                    </ResizeHandleOverlay>
                )}
                <TableComponent>
                    <TableHead>
                        {tableInstance.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    const cellWidth = enableResizing
                                        ? header.column.getSize()
                                        : undefined;
                                    return (
                                        <th
                                            key={header.id}
                                            style={
                                                enableResizing
                                                    ? {
                                                          width: cellWidth,
                                                          minWidth: 50,
                                                          maxWidth: cellWidth,
                                                          padding: 0,
                                                      }
                                                    : undefined
                                            }
                                        >
                                            {HeaderCell(header, enableResizing)}
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
                                    const cellWidth = enableResizing
                                        ? cell.column.getSize()
                                        : undefined;
                                    return (
                                        <TableCell
                                            key={cell.id}
                                            style={
                                                enableResizing
                                                    ? {
                                                          width: cellWidth,
                                                          minWidth: 50,
                                                          maxWidth: cellWidth,
                                                      }
                                                    : undefined
                                            }
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
                </TableComponent>
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
