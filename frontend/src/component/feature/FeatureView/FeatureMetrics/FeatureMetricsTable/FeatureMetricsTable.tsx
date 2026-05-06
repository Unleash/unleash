import type { IFeatureMetricsRaw } from 'interfaces/featureToggle';
import { TableBody, TableRow, useMediaQuery } from '@mui/material';
import { DateTimeCell } from 'component/common/Table/cells/DateTimeCell/DateTimeCell';
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { SortableTableHeaderV8 } from 'component/common/Table/SortableTableHeader/SortableTableHeaderV8';
import { TableCell, Table } from 'component/common/Table';
import { IconCell } from 'component/common/Table/cells/IconCell/IconCell';
import Assessment from '@mui/icons-material/Assessment';
import { useMemo } from 'react';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import theme from 'themes/theme';
import { useConditionallyHiddenColumnsV8 } from 'hooks/useConditionallyHiddenColumnsV8';
import { ApplicationsCell } from './ApplicationsCell.tsx';

interface IFeatureMetricsTableProps {
    metrics: IFeatureMetricsRaw[];
    tableSectionId?: string;
}

const COLUMNS: ColumnDef<IFeatureMetricsRaw, any>[] = [
    {
        id: 'Icon',
        meta: { width: '1%' },
        enableSorting: false,
        cell: () => <IconCell icon={<Assessment color='disabled' />} />,
    },
    {
        id: 'timestamp',
        header: 'Time',
        accessorKey: 'timestamp',
        cell: ({ row }) => (
            <DateTimeCell
                value={row.original.timestamp}
                timeZone={
                    row.original.timestamp.includes('23:59')
                        ? 'UTC'
                        : undefined
                }
            />
        ),
    },
    {
        id: 'appName',
        header: 'Application',
        accessorKey: 'appName',
        cell: ({ row }) => <ApplicationsCell row={row} />,
    },
    {
        id: 'environment',
        header: 'Environment',
        accessorKey: 'environment',
    },
    {
        id: 'requested',
        header: 'Requested',
        accessorFn: (original) => original.yes + original.no,
    },
    {
        id: 'yes',
        header: 'Enabled',
        accessorKey: 'yes',
    },
];

export const FeatureMetricsTable = ({
    metrics,
    tableSectionId,
}: IFeatureMetricsTableProps) => {
    const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));

    const initialState = useMemo(
        () => ({ sorting: [{ id: 'timestamp', desc: false }] }),
        [],
    );

    const table = useReactTable({
        initialState,
        columns: COLUMNS,
        data: metrics,
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

    useConditionallyHiddenColumnsV8(
        [
            {
                condition: isMediumScreen,
                columns: ['appName', 'environment'],
            },
        ],
        table.setColumnVisibility,
        COLUMNS,
    );

    if (metrics.length === 0) {
        return null;
    }

    return (
        <Table rowHeight='standard' id={tableSectionId}>
            <SortableTableHeaderV8 tableInstance={table} />
            <TableBody>
                {table.getRowModel().rows.map((row) => (
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
    );
};
