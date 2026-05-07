import {
    Table,
    TableBody,
    TableCell,
    TableRow,
    TablePlaceholder,
} from 'component/common/Table';
import { SortableTableHeaderV8 } from 'component/common/Table/SortableTableHeader/SortableTableHeaderV8';
import { PageContent } from 'component/common/PageContent/PageContent';
import { DateCell } from 'component/common/Table/cells/DateCell/DateCell';
import { useMemo, type VFC } from 'react';
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
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

const columns: ColumnDef<Record<string, any>, unknown>[] = [
    {
        id: 'amountFormatted',
        header: 'Amount',
        accessorKey: 'amountFormatted',
    },
    {
        id: 'status',
        header: 'Status',
        accessorKey: 'status',
        enableGlobalFilter: false,
    },
    {
        id: 'created',
        header: 'Created date',
        accessorKey: 'created',
        cell: DateCell,
        enableGlobalFilter: false,
    },
    {
        id: 'dueDate',
        header: 'Due date',
        accessorKey: 'dueDate',
        cell: DateCell,
        enableGlobalFilter: false,
    },
    {
        id: 'invoicePDF',
        header: 'Download',
        accessorKey: 'invoicePDF',
        cell: ({ getValue }) => (
            <Box
                sx={{ display: 'flex', justifyContent: 'center' }}
                data-loading
            >
                <IconButton href={String(getValue() ?? '')}>
                    <FileDownload />
                </IconButton>
            </Box>
        ),
        enableSorting: false,
        enableGlobalFilter: false,
        meta: { width: 100, align: 'center' },
    },
];

export const BillingHistory: VFC<IBillingHistoryProps> = ({
    data,
    isLoading = false,
}) => {
    const initialState = useMemo(
        () => ({
            sorting: [{ id: 'created', desc: true }],
        }),
        [],
    );

    const table = useReactTable({
        columns,
        data,
        initialState,
        defaultColumn: {
            cell: ({ getValue }) => (
                <TextCell value={String(getValue() ?? '')} />
            ),
        },
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        autoResetAll: false,
        enableSortingRemoval: false,
    });

    const rows = table.getRowModel().rows;

    return (
        <PageContent isLoading={isLoading} disablePadding>
            <StyledTitle>Payment history</StyledTitle>
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
            <ConditionallyRender
                condition={rows.length === 0}
                show={<TablePlaceholder>No invoices to show.</TablePlaceholder>}
            />
        </PageContent>
    );
};
