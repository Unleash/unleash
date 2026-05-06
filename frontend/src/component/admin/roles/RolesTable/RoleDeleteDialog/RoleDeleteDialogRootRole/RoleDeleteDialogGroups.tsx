import { VirtualizedTableV8 } from 'component/common/Table/VirtualizedTable/VirtualizedTableV8';
import { DateCell } from 'component/common/Table/cells/DateCell/DateCell';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';
import { useMemo, useState } from 'react';
import {
    type ColumnDef,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import type { IGroup } from 'interfaces/group';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';

export type PageQueryType = Partial<
    Record<'sort' | 'order' | 'search', string>
>;

interface IRoleDeleteDialogGroupsProps {
    groups: IGroup[];
}

export const RoleDeleteDialogGroups = ({
    groups,
}: IRoleDeleteDialogGroupsProps) => {
    const [initialState] = useState(() => ({
        sorting: [{ id: 'createdAt', desc: true }],
    }));

    const columns = useMemo<ColumnDef<IGroup, unknown>[]>(
        () => [
            {
                id: 'name',
                header: 'Name',
                accessorFn: (row) => row.name || '',
                meta: { minWidth: 200 },
                cell: ({ row: { original: group } }) => (
                    <HighlightCell
                        value={group.name ?? ''}
                        subtitle={group.description}
                    />
                ),
            },
            {
                id: 'createdAt',
                header: 'Created',
                accessorKey: 'createdAt',
                cell: DateCell,
                meta: { width: 120, maxWidth: 120 },
            },
            {
                id: 'users',
                header: 'Users',
                accessorFn: (row) =>
                    row.users.length === 1
                        ? '1 user'
                        : `${row.users.length} users`,
                cell: TextCell,
                meta: { maxWidth: 150 },
            },
        ],
        [],
    );

    const table = useReactTable({
        columns,
        data: groups,
        initialState,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        autoResetAll: false,
        enableSortingRemoval: false,
        enableMultiSort: false,
    });

    return <VirtualizedTableV8 tableInstance={table} />;
};
