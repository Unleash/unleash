import { VirtualizedTable } from 'component/common/Table/VirtualizedTable/VirtualizedTable';
import { DateCell } from 'component/common/Table/cells/DateCell/DateCell';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';
import { useMemo, useState } from 'react';
import {
    type ColumnDef,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { TimeAgoCell } from 'component/common/Table/cells/TimeAgoCell/TimeAgoCell';
import type { IUser } from 'interfaces/user';

export type PageQueryType = Partial<
    Record<'sort' | 'order' | 'search', string>
>;

interface IRoleDeleteDialogUsersProps {
    users: IUser[];
}

export const RoleDeleteDialogUsers = ({
    users,
}: IRoleDeleteDialogUsersProps) => {
    const [initialState] = useState(() => ({
        sorting: [{ id: 'last-login', desc: true }],
    }));

    const columns = useMemo<ColumnDef<IUser, unknown>[]>(
        () => [
            {
                id: 'name',
                header: 'Name',
                accessorFn: (row) => row.name || '',
                meta: { minWidth: 200 },
                cell: ({ row: { original: user } }) => (
                    <HighlightCell
                        value={user.name ?? ''}
                        subtitle={user.email || user.username}
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
                id: 'last-login',
                header: 'Last login',
                accessorKey: 'seenAt',
                cell: TimeAgoCell,
                meta: { maxWidth: 150 },
            },
        ],
        [],
    );

    const table = useReactTable({
        columns,
        data: users,
        initialState,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        autoResetAll: false,
        enableSortingRemoval: false,
        enableMultiSort: false,
    });

    return <VirtualizedTable tableInstance={table} />;
};
