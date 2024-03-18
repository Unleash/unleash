import { TableBody, TableRow, TableHead } from '@mui/material';
import { Table } from 'component/common/Table/Table/Table';
import {
    type Header,
    type Table as TableType,
    flexRender,
} from '@tanstack/react-table';
import { TableCell } from '../TableCell/TableCell';
import { CellSortable } from '../SortableTableHeader/CellSortable/CellSortable';
import { StickyPaginationBar } from 'component/common/Table/StickyPaginationBar/StickyPaginationBar';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { styled } from '@mui/material';

const HeaderCell = <T extends object>(header: Header<T, unknown>) => {
    const column = header.column;
    const isDesc = column.getIsSorted() === 'desc';
    const align = column.columnDef.meta?.align || undefined;
    const width = column.columnDef.meta?.width || undefined;
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
                minWidth: fixedWidth,
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

    return (
        <>
            <TableContainer>
                <Table>
                    <TableHead>
                        {tableInstance.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <HeaderCell {...header} key={header.id} />
                                ))}
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
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext(),
                                        )}
                                    </TableCell>
                                ))}
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
                        fetchNextPage={() =>
                            tableInstance.setPagination({
                                pageIndex: pagination.pageIndex + 1,
                                pageSize: pagination.pageSize,
                            })
                        }
                        fetchPrevPage={() =>
                            tableInstance.setPagination({
                                pageIndex: pagination.pageIndex - 1,
                                pageSize: pagination.pageSize,
                            })
                        }
                        setPageLimit={(pageSize) =>
                            tableInstance.setPagination({
                                pageIndex: 0,
                                pageSize,
                            })
                        }
                    />
                }
            />
        </>
    );
};
