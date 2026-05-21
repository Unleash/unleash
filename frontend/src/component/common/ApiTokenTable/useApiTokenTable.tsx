import { useMemo, useState, type JSX } from 'react';
import type { IApiToken } from 'hooks/api/getters/useApiTokens/useApiTokens';
import { DateCell } from 'component/common/Table/cells/DateCell/DateCell';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';
import { TimeAgoCell } from 'component/common/Table/cells/TimeAgoCell/TimeAgoCell';
import {
    type CellContext,
    type ColumnDef,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { ProjectsList } from 'component/admin/apiToken/ProjectsList/ProjectsList';
import { ApiTokenIcon } from 'component/admin/apiToken/ApiTokenIcon/ApiTokenIcon';

type ActionCellProps = {
    row: { original: IApiToken };
};

export const useApiTokenTable = (
    tokens: IApiToken[],
    getActionCell: (props: ActionCellProps) => JSX.Element,
) => {
    const [globalFilter, setGlobalFilter] = useState('');

    const initialState = useMemo(
        () => ({ sorting: [{ id: 'createdAt', desc: true }] }),
        [],
    );

    // biome-ignore lint/correctness/useExhaustiveDependencies: getActionCell is intentionally omitted -- callers pass inline functions; including it would defeat memoization
    const columns = useMemo<ColumnDef<IApiToken, unknown>[]>(
        () => [
            {
                id: 'Icon',
                cell: ({ row }) => (
                    <ApiTokenIcon
                        secret={row.original.secret}
                        project={row.original.project}
                        projects={row.original.projects}
                    />
                ),
                enableSorting: false,
                enableGlobalFilter: false,
                meta: { width: 50 },
            },
            {
                id: 'tokenName',
                header: 'Token name',
                accessorKey: 'tokenName',
                cell: HighlightCell,
                meta: { minWidth: 35 },
            },
            {
                id: 'type',
                header: 'Type',
                accessorKey: 'type',
                cell: ({ getValue }) => {
                    const value = String(getValue() ?? '').toLowerCase();
                    const description = tokenDescriptions[value];
                    return (
                        <HighlightCell
                            value={description?.label ?? ''}
                            subtitle={description?.title}
                            subtitleTooltip
                        />
                    );
                },
                meta: { width: 180 },
            },
            {
                id: 'project',
                header: 'Project',
                accessorKey: 'project',
                cell: ({ row }) => (
                    <ProjectsList
                        project={row.original.project}
                        projects={row.original.projects}
                    />
                ),
                meta: { width: 160 },
            },
            {
                id: 'environment',
                header: 'Environment',
                accessorKey: 'environment',
                cell: HighlightCell,
                meta: { width: 120 },
            },
            {
                id: 'createdAt',
                header: 'Created',
                accessorKey: 'createdAt',
                cell: DateCell,
                enableGlobalFilter: false,
                meta: { width: 150 },
            },
            {
                id: 'seenAt',
                header: 'Last seen',
                accessorKey: 'seenAt',
                cell: TimeAgoCell,
                enableGlobalFilter: false,
                meta: { width: 140 },
            },
            {
                id: 'Actions',
                header: 'Actions',
                cell: (info: CellContext<IApiToken, unknown>) =>
                    getActionCell({ row: info.row }),
                enableSorting: false,
                enableGlobalFilter: false,
                meta: { width: 120, align: 'center' },
            },
        ],
        [],
    );

    const table = useReactTable({
        columns,
        data: tokens,
        initialState,
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        autoResetAll: false,
        enableSortingRemoval: false,
    });

    return {
        table,
        columns,
        globalFilter,
        setGlobalFilter,
    };
};

const tokenDescriptions: {
    [index: string]: { label: string; title: string };
} = {
    client: {
        label: 'BACKEND',
        title: 'Connect backend SDK or Unleash Edge',
    },
    backend: {
        label: 'BACKEND',
        title: 'Connect backend SDK or Unleash Edge',
    },
    frontend: {
        label: 'FRONTEND',
        title: 'Connect frontend SDK',
    },
    admin: {
        label: 'ADMIN',
        title: 'Full access for managing Unleash',
    },
};
