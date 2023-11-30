import { TableBody, TableRow, TableHead } from '@mui/material';
import { Table } from 'component/common/Table/Table/Table';
import { Header, HeaderGroup, Row, flexRender } from '@tanstack/react-table';
import { TableCell } from '../TableCell/TableCell';
import { CellSortable } from '../SortableTableHeader/CellSortable/CellSortable';
import { StickyPaginationBar } from 'component/project/Project/StickyPaginationBar/StickyPaginationBar';

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
    headerGroups,
    rows,
}: {
    headerGroups: HeaderGroup<T>[];
    rows: Row<T>[];
    fullWidth?: boolean;
}) => {
    return (
        <>
            <Table>
                <TableHead>
                    {headerGroups.map((headerGroup) => (
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
                    {rows.map((row) => (
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
            <StickyPaginationBar
                total={1}
                currentOffset={0}
                fetchPrevPage={() => {}}
                fetchNextPage={() => {}}
                hasPreviousPage={false}
                hasNextPage={false}
                pageLimit={1}
                setPageLimit={() => {}}
            />
        </>
    );
};
