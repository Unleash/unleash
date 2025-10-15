import { TableBody, TableRow, TableHead } from '@mui/material';
import { useRef } from 'react';
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

const ResizeHandle = styled('div')(({ theme }) => ({
    position: 'absolute',
    right: 0,
    top: 0,
    height: '100%',
    width: '8px',
    cursor: 'col-resize',
    userSelect: 'none',
    touchAction: 'none',
    zIndex: 1,
    '&::after': {
        content: '""',
        position: 'absolute',
        right: '3px',
        top: '50%',
        transform: 'translateY(-50%)',
        height: '60%',
        width: '2px',
        backgroundColor: 'transparent',
    },
    '&:hover::after': {
        backgroundColor: theme.palette.primary.main,
    },
}));

const HeaderCell = <T extends object>(
    header: Header<T, unknown>,
    enableFixedLayout: boolean,
) => {
    const column = header.column;
    const isDesc = column.getIsSorted() === 'desc';
    const align = column.columnDef.meta?.align || undefined;
    const width = column.columnDef.meta?.width || undefined;
    const fixedWidth = width && typeof width === 'number' ? width : undefined;
    const content = column.columnDef.header;
    const canResize = enableFixedLayout && column.getCanResize();

    // Use column.getSize() for fixed layout, otherwise use meta.width
    const columnSize = enableFixedLayout ? column.getSize() : width;

    const handleResizeMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();
        const resizeHandler = header.getResizeHandler();
        resizeHandler(e);
    };

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
                width: columnSize,
                maxWidth: enableFixedLayout ? columnSize : fixedWidth,
                minWidth: enableFixedLayout ? columnSize : fixedWidth,
                position: canResize ? 'relative' : undefined,
            }}
            ariaTitle={typeof content === 'string' ? content : undefined}
        >
            {header.isPlaceholder
                ? null
                : flexRender(content, header.getContext())}
            {canResize && (
                <ResizeHandle
                    onMouseDown={handleResizeMouseDown}
                    onTouchStart={handleResizeMouseDown}
                />
            )}
        </CellSortable>
    );
};

const TableContainer = styled('div')(({ theme }) => ({
    overflowX: 'auto',
    isolation: 'isolate',
    position: 'relative',
}));

/**
 * Use with react-table v8
 */
export const PaginatedTable = <T extends object>({
    totalItems,
    tableInstance,
    enableFixedLayout = false,
}: {
    tableInstance: TableType<T>;
    totalItems?: number;
    enableFixedLayout?: boolean;
}) => {
    const { pagination } = tableInstance.getState();
    const tableRef = useRef<HTMLDivElement>(null);

    const scrollToTopIfNeeded = () => {
        if (!tableRef.current) return;

        const rect = tableRef.current.getBoundingClientRect();
        const isTableTopVisible = rect.top >= 0;

        if (!isTableTopVisible) {
            tableRef.current.scrollIntoView({ block: 'start' });
        }
    };

    // Calculate total width for fixed table layout
    const totalWidth = enableFixedLayout
        ? tableInstance.getAllColumns().reduce((sum, column) => sum + column.getSize(), 0)
        : undefined;

    return (
        <>
            <TableContainer ref={tableRef}>
                <Table
                    sx={
                        enableFixedLayout && totalWidth
                            ? {
                                  tableLayout: 'fixed',
                                  width: '100%',
                                  minWidth: `${totalWidth}px`,
                              }
                            : undefined
                    }
                >
                    <TableHead>
                        {tableInstance.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) =>
                                    HeaderCell(header, enableFixedLayout),
                                )}
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
                                    const cellWidth = enableFixedLayout
                                        ? cell.column.getSize()
                                        : undefined;
                                    return (
                                        <TableCell
                                            key={cell.id}
                                            style={
                                                cellWidth
                                                    ? {
                                                          width: cellWidth,
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
