import { TableBody, TableRow, TableHead } from '@mui/material';
import { Table } from 'component/common/Table/Table/Table';
import { Header, HeaderGroup, Row, flexRender } from '@tanstack/react-table';
import { TableCell } from '../TableCell/TableCell';
import { CellSortable } from '../SortableTableHeader/CellSortable/CellSortable';

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
}) => {
    return (
        <Table>
            <TableHead>
                {headerGroups.map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map(HeaderCell)}
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
    );
};
