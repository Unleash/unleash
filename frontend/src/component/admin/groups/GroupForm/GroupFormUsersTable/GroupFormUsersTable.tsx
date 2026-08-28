import { useMemo, type FC } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import type { IGroupUser } from 'interfaces/group';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';
import { ActionCell } from 'component/common/Table/cells/ActionCell/ActionCell';
import Delete from '@mui/icons-material/Delete';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { VirtualizedTable } from 'component/common/Table/VirtualizedTable/VirtualizedTable';
import {
    type ColumnDef,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { UserAvatar } from 'component/common/UserAvatar/UserAvatar';

interface IGroupFormUsersTableProps {
    users: IGroupUser[];
    setUsers: React.Dispatch<React.SetStateAction<IGroupUser[]>>;
}

export const GroupFormUsersTable: FC<IGroupFormUsersTableProps> = ({
    users,
    setUsers,
}) => {
    const columns = useMemo<ColumnDef<IGroupUser, unknown>[]>(
        () => [
            {
                id: 'imageUrl',
                header: 'Avatar',
                accessorKey: 'imageUrl',
                cell: ({ row: { original: user } }) => (
                    <TextCell>
                        <UserAvatar user={user} />
                    </TextCell>
                ),
                enableSorting: false,
                meta: { maxWidth: 85 },
            },
            {
                id: 'name',
                header: 'Name',
                accessorFn: (row) => row.name || '',
                cell: ({ getValue, row: { original: row } }) => (
                    <HighlightCell
                        value={String(getValue() ?? '')}
                        subtitle={row.email || row.username}
                    />
                ),
                meta: { minWidth: 100 },
            },
            {
                id: 'Action',
                header: 'Action',
                cell: ({ row: { original: rowUser } }) => (
                    <ActionCell>
                        <Tooltip
                            title='Remove user from group'
                            arrow
                            describeChild
                        >
                            <IconButton
                                onClick={() =>
                                    setUsers((users: IGroupUser[]) =>
                                        users.filter(
                                            (user) => user.id !== rowUser.id,
                                        ),
                                    )
                                }
                            >
                                <Delete />
                            </IconButton>
                        </Tooltip>
                    </ActionCell>
                ),
                enableSorting: false,
                meta: { maxWidth: 100, align: 'center' },
            },
        ],
        [setUsers],
    );

    const table = useReactTable({
        columns,
        data: users,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        autoResetAll: false,
        enableSortingRemoval: false,
        enableMultiSort: false,
    });

    return (
        <ConditionallyRender
            condition={table.getRowModel().rows.length > 0}
            show={<VirtualizedTable tableInstance={table} />}
        />
    );
};
