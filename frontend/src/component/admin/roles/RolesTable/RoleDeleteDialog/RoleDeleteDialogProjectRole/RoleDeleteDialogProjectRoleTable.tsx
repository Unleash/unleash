import { VirtualizedTableV8 } from 'component/common/Table/VirtualizedTable/VirtualizedTableV8';
import { useMemo, useState } from 'react';
import {
    type ColumnDef,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import type { IProjectRoleUsageCount } from 'interfaces/project';
import { LinkCell } from 'component/common/Table/cells/LinkCell/LinkCell';

interface IRoleDeleteDialogProjectRoleTableProps {
    projects: IProjectRoleUsageCount[];
}

export const RoleDeleteDialogProjectRoleTable = ({
    projects,
}: IRoleDeleteDialogProjectRoleTableProps) => {
    const [initialState] = useState(() => ({
        sorting: [{ id: 'name', desc: false }],
    }));

    const columns = useMemo<ColumnDef<IProjectRoleUsageCount, unknown>[]>(
        () => [
            {
                id: 'name',
                header: 'Project name',
                accessorFn: (row) => row.project || '',
                meta: { minWidth: 200 },
                cell: ({ row: { original: item } }) => (
                    <LinkCell
                        title={item.project}
                        to={`/projects/${item.project}`}
                    />
                ),
            },
            {
                id: 'users',
                header: 'Assigned users',
                accessorFn: (row) =>
                    row.userCount === 1
                        ? '1 user'
                        : `${row.userCount} users`,
                cell: TextCell,
                meta: { maxWidth: 150 },
            },
            {
                id: 'serviceAccounts',
                header: 'Service accounts',
                accessorFn: (row) =>
                    row.serviceAccountCount === 1
                        ? '1 account'
                        : `${row.serviceAccountCount} accounts`,
                cell: TextCell,
                meta: { maxWidth: 150 },
            },
            {
                id: 'groups',
                header: 'Assigned groups',
                accessorFn: (row) =>
                    row.groupCount === 1
                        ? '1 group'
                        : `${row.groupCount} groups`,
                cell: TextCell,
                meta: { maxWidth: 150 },
            },
        ],
        [],
    );

    const table = useReactTable({
        columns,
        data: projects,
        initialState,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        autoResetAll: false,
        enableSortingRemoval: false,
        enableMultiSort: false,
    });

    return <VirtualizedTableV8 tableInstance={table} />;
};
