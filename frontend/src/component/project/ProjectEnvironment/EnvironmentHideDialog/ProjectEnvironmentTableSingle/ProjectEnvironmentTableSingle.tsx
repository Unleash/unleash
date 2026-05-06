import { styled, TableBody, TableRow } from '@mui/material';
import type { IProjectEnvironment } from 'interfaces/environments';
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { Table, TableCell } from 'component/common/Table';
import { SortableTableHeaderV8 } from 'component/common/Table/SortableTableHeader/SortableTableHeaderV8';
import { EnvironmentIconCell } from 'component/environments/EnvironmentTable/EnvironmentIconCell/EnvironmentIconCell';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { useMemo } from 'react';

const StyledTable = styled(Table)(({ theme }) => ({
    marginTop: theme.spacing(3),
}));

const StyledToggleWarning = styled('p', {
    shouldForwardProp: (prop) => prop !== 'warning',
})<{ warning?: boolean }>(({ theme, warning }) => ({
    color: warning ? theme.palette.error.dark : theme.palette.text.primary,
    textAlign: 'center',
}));

interface IProjectEnvironmentTableSingleProps {
    environment: IProjectEnvironment;
    warnEnabledToggles?: boolean;
}

export const ProjectEnvironmentTableSingle = ({
    environment,
    warnEnabledToggles,
}: IProjectEnvironmentTableSingleProps) => {
    const columns = useMemo<ColumnDef<IProjectEnvironment, unknown>[]>(
        () => [
            {
                id: 'Icon',
                cell: ({ row: { original } }) => (
                    <EnvironmentIconCell environment={original} />
                ),
                meta: { width: '1%' },
            },
            {
                id: 'name',
                header: 'Name',
                accessorKey: 'name',
                cell: TextCell,
            },
            {
                id: 'type',
                header: 'Type',
                accessorKey: 'type',
                cell: TextCell,
            },
            {
                id: 'projectEnabledToggleCount',
                header: 'Toggles enabled',
                accessorKey: 'projectEnabledToggleCount',
                cell: ({ getValue }) => {
                    const value = (getValue() as number | undefined) ?? 0;
                    return (
                        <TextCell>
                            <StyledToggleWarning warning={value > 0}>
                                {value === 1
                                    ? '1 toggle'
                                    : `${value} toggles`}
                            </StyledToggleWarning>
                        </TextCell>
                    );
                },
                meta: { align: 'center' },
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [warnEnabledToggles],
    );

    const table = useReactTable({
        columns,
        data: [environment],
        getCoreRowModel: getCoreRowModel(),
        enableSorting: false,
    });

    return (
        <StyledTable rowHeight='compact'>
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
        </StyledTable>
    );
};
