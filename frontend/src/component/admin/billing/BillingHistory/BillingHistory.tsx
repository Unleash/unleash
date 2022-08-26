import {
    Table,
    SortableTableHeader,
    TableBody,
    TableCell,
    TableRow,
    TablePlaceholder,
} from 'component/common/Table';
import { PageContent } from 'component/common/PageContent/PageContent';
import { DateCell } from 'component/common/Table/cells/DateCell/DateCell';
import { useMemo, VFC } from 'react';
import { useGlobalFilter, useSortBy, useTable } from 'react-table';
import { sortTypes } from 'utils/sortTypes';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Box, IconButton, styled, Typography } from '@mui/material';
import FileDownload from '@mui/icons-material/FileDownload';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';

const StyledTitle = styled(Typography)(({ theme }) => ({
    marginTop: theme.spacing(6),
    marginBottom: theme.spacing(2.5),
    fontSize: theme.fontSizes.mainHeader,
}));
interface IBillingHistoryProps {
    data: Record<string, any>[];
    isLoading?: boolean;
}

const columns = [
    {
        Header: 'Amount',
        accessor: 'amountFormatted',
    },
    {
        Header: 'Status',
        accessor: 'status',
        disableGlobalFilter: true,
    },
    {
        Header: 'Due date',
        accessor: 'dueDate',
        Cell: DateCell,
        sortType: 'date',
        disableGlobalFilter: true,
    },
    {
        Header: 'Download',
        accessor: 'invoicePDF',
        align: 'center',
        Cell: ({ value }: { value: string }) => (
            <Box
                sx={{ display: 'flex', justifyContent: 'center' }}
                data-loading
            >
                <IconButton href={value}>
                    <FileDownload />
                </IconButton>
            </Box>
        ),
        width: 100,
        disableGlobalFilter: true,
        disableSortBy: true,
    },
];

export const BillingHistory: VFC<IBillingHistoryProps> = ({
    data,
    isLoading = false,
}) => {
    const initialState = useMemo(
        () => ({
            sortBy: [{ id: 'dueDate' }],
        }),
        []
    );

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
        useTable(
            {
                columns,
                data,
                initialState,
                sortTypes,
                autoResetGlobalFilter: false,
                disableSortRemove: true,
                defaultColumn: {
                    Cell: TextCell,
                },
            },
            useGlobalFilter,
            useSortBy
        );

    return (
        <PageContent isLoading={isLoading} disablePadding>
            <StyledTitle>Payment history</StyledTitle>
            <Table {...getTableProps()}>
                <SortableTableHeader headerGroups={headerGroups} />
                <TableBody {...getTableBodyProps()}>
                    {rows.map(row => {
                        prepareRow(row);
                        return (
                            <TableRow hover {...row.getRowProps()}>
                                {row.cells.map(cell => (
                                    <TableCell {...cell.getCellProps()}>
                                        {cell.render('Cell')}
                                    </TableCell>
                                ))}
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
            <ConditionallyRender
                condition={rows.length === 0}
                show={<TablePlaceholder>No invoices to show.</TablePlaceholder>}
            />
        </PageContent>
    );
};
