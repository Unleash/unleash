import type {
    Row,
    TablePropGetter,
    TableProps,
    TableBodyPropGetter,
    TableBodyProps,
    HeaderGroup,
} from 'react-table';
import {
    SortableTableHeader,
    TableCell,
    TablePlaceholder,
} from 'component/common/Table';
import { Box, Table, TableBody, TableRow } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

type ConnectedInstancesTableProps = {
    loading: boolean;
    rows: Row<object>[];
    prepareRow: (row: Row<object>) => void;
    getTableProps: (
        propGetter?: TablePropGetter<object> | undefined,
    ) => TableProps;
    getTableBodyProps: (
        propGetter?: TableBodyPropGetter<object> | undefined,
    ) => TableBodyProps;
    headerGroups: HeaderGroup<object>[];
};
export const ConnectedInstancesTable = ({
    loading,
    rows,
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
}: ConnectedInstancesTableProps) => {
    return (
        <>
            <Box sx={{ overflowX: 'auto' }}>
                <Table {...getTableProps()}>
                    <SortableTableHeader headerGroups={headerGroups as any} />
                    <TableBody {...getTableBodyProps()}>
                        {rows.map((row) => {
                            prepareRow(row);
                            const { key, ...rowProps } = row.getRowProps();
                            return (
                                <TableRow hover key={key} {...rowProps}>
                                    {row.cells.map((cell) => {
                                        const { key, ...cellProps } =
                                            cell.getCellProps();
                                        return (
                                            <TableCell key={key} {...cellProps}>
                                                {cell.render('Cell')}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            );
                        })}
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
