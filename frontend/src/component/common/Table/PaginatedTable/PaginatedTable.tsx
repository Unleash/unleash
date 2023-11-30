import { TableBody, TableRow, TableHead } from '@mui/material';
import { Table } from 'component/common/Table/Table/Table';
import {
    Header,
    type Table as TableType,
    flexRender,
} from '@tanstack/react-table';
import { TableCell } from '../TableCell/TableCell';
import { CellSortable } from '../SortableTableHeader/CellSortable/CellSortable';
import { StickyPaginationBar } from 'component/common/Table/StickyPaginationBar/StickyPaginationBar';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

const HeaderCell = <T extends object>(header: Header<T, unknown>) => {
    const column = header.column;
    const isDesc = column.getIsSorted() === 'desc';
    const align = column.columnDef.meta?.align || undefined;

    return (
        <CellSortable
            isSortable={column.getCanSort()}
            isSorted={column.getIsSorted() !== false}
            isDescending={isDesc}
            align={align}
            onClick={() => column.toggleSorting()}
            styles={{ borderRadius: '0px' }}
        >
            {header.isPlaceholder
                ? null
                : flexRender(column.columnDef.header, header.getContext())}
        </CellSortable>
    );
};

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
            <ConditionallyRender
                condition={tableInstance.getRowModel().rows.length > 0}
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
