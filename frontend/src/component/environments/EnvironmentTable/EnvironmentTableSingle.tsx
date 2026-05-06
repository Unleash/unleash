import { styled, TableBody, TableRow } from '@mui/material';
import type { IEnvironment } from 'interfaces/environments';
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { Table, TableCell } from 'component/common/Table';
import { SortableTableHeader } from 'component/common/Table/SortableTableHeader/SortableTableHeader';
import { EnvironmentIconCell } from 'component/environments/EnvironmentTable/EnvironmentIconCell/EnvironmentIconCell';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useMemo } from 'react';

const StyledTable = styled(Table)(({ theme }) => ({
    marginTop: theme.spacing(3),
}));

const StyledToggleWarning = styled('p', {
    shouldForwardProp: (prop) => prop !== 'warning',
})<{ warning?: boolean }>(({ theme, warning }) => ({
    color: warning ? theme.palette.error.dark : theme.palette.text.primary,
}));

interface IEnvironmentTableSingleProps {
    environment: IEnvironment;
    warnEnabledToggles?: boolean;
}

export const EnvironmentTableSingle = ({
    environment,
    warnEnabledToggles,
}: IEnvironmentTableSingleProps) => {
    const columns = useMemo<ColumnDef<IEnvironment, unknown>[]>(
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
                id: 'projectCount',
                header: 'Visible in',
                accessorFn: (row) =>
                    row.projectCount === 1
                        ? '1 project'
                        : `${row.projectCount} projects`,
                cell: ({ getValue, row: { original } }) => (
                    <TextCell>
                        {String(getValue() ?? '')}
                        <ConditionallyRender
                            condition={Boolean(warnEnabledToggles)}
                            show={
                                <StyledToggleWarning
                                    warning={Boolean(
                                        original.enabledToggleCount &&
                                            original.enabledToggleCount > 0,
                                    )}
                                >
                                    {original.enabledToggleCount === 1
                                        ? '1 toggle enabled'
                                        : `${original.enabledToggleCount} toggles enabled`}
                                </StyledToggleWarning>
                            }
                        />
                    </TextCell>
                ),
            },
        ],
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
            <SortableTableHeader tableInstance={table} />
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
