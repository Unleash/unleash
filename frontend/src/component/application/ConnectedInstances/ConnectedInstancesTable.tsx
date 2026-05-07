import { type Table as TableType, flexRender } from '@tanstack/react-table';
import { TableCell, TablePlaceholder } from 'component/common/Table';
import { SortableTableHeaderV8 } from 'component/common/Table/SortableTableHeader/SortableTableHeaderV8';
import { Box, Table, TableBody, TableRow } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

type ConnectedInstancesTableProps<T> = {
    loading: boolean;
    table: TableType<T>;
};

export const ConnectedInstancesTable = <T,>({
    loading,
    table,
}: ConnectedInstancesTableProps<T>) => {
    const rows = table.getRowModel().rows;
    return (
        <>
            <Box sx={{ overflowX: 'auto' }}>
                <Table>
                    <SortableTableHeaderV8 tableInstance={table} />
                    <TableBody>
                        {rows.map((row) => (
                            <TableRow hover key={row.id}>
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
            </Box>
            <ConditionallyRender
                condition={rows.length === 0 && !loading}
                show={
                    <TablePlaceholder>
                        <p>
                            There's no data for any connected instances to
                            display. Have you configured your clients correctly?
                        </p>
                    </TablePlaceholder>
                }
            />
        </>
    );
};
