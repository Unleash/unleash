import {
    type IInactiveUser,
    useInactiveUsers,
} from 'hooks/api/getters/useInactiveUsers/useInactiveUsers';
import { useUsers } from 'hooks/api/getters/useUsers/useUsers';
import useAdminUsersApi from 'hooks/api/actions/useAdminUsersApi/useAdminUsersApi';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import type React from 'react';
import { useMemo, useState } from 'react';
import { TimeAgoCell } from 'component/common/Table/cells/TimeAgoCell/TimeAgoCell';
import type { IRole } from 'interfaces/role';
import { RoleCell } from 'component/common/Table/cells/RoleCell/RoleCell';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';
import {
    type ColumnDef,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { TablePlaceholder } from 'component/common/Table';
import { VirtualizedTable } from 'component/common/Table/VirtualizedTable/VirtualizedTable';
import { DateCell } from 'component/common/Table/cells/DateCell/DateCell';
import { InactiveUsersActionCell } from './InactiveUsersActionCell/InactiveUsersActionCell.tsx';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import DeleteUser from './DeleteUser/DeleteUser.tsx';

type InactiveUserRow = IInactiveUser & { rootRole?: number };

export const InactiveUsersListBody = () => {
    const { removeUser, userApiErrors } = useAdminUsersApi();
    const { setToastData, setToastApiError } = useToast();
    const { inactiveUsers, refetchInactiveUsers } = useInactiveUsers();
    const { users, roles, loading: usersLoading } = useUsers();
    const [delDialog, setDelDialog] = useState(false);
    const [delUser, setDelUser] = useState<IInactiveUser>();
    const closeDelDialog = () => {
        setDelDialog(false);
        setDelUser(undefined);
    };

    const openDelDialog =
        (user: IInactiveUser) => (e: React.SyntheticEvent<Element, Event>) => {
            e.preventDefault();
            setDelDialog(true);
            setDelUser(user);
        };

    const onDeleteUser = async (userId: number) => {
        try {
            await removeUser(userId);
            setToastData({
                text: `User has been deleted`,
                type: 'success',
            });
            refetchInactiveUsers();
            closeDelDialog();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const massagedData = useMemo<InactiveUserRow[]>(
        () =>
            inactiveUsers.map((inactiveUser) => {
                const u = users.find((u) => u.id === inactiveUser.id);
                return {
                    ...inactiveUser,
                    rootRole: u?.rootRole,
                };
            }),
        [inactiveUsers, users],
    );

    const columns = useMemo<ColumnDef<InactiveUserRow, unknown>[]>(
        () => [
            {
                id: 'name',
                header: 'Name',
                accessorFn: (row) => row.name || '',
                cell: ({ getValue, row: { original: user } }) => (
                    <HighlightCell
                        value={String(getValue() ?? '')}
                        subtitle={user.email || user.username}
                    />
                ),
                meta: { minWidth: 200 },
            },
            {
                id: 'role',
                header: 'Role',
                accessorFn: (row) =>
                    roles.find((role: IRole) => role.id === row.rootRole)
                        ?.name || '',
                cell: ({ getValue, row: { original: user } }) => (
                    <RoleCell
                        value={String(getValue() ?? '')}
                        role={user.rootRole ?? 0}
                    />
                ),
                meta: { maxWidth: 120 },
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
            {
                id: 'pat-last-login',
                header: 'PAT last used',
                accessorKey: 'patSeenAt',
                cell: TimeAgoCell,
                meta: { maxWidth: 150 },
            },
            {
                id: 'Actions',
                header: 'Actions',
                cell: ({ row: { original: user } }) => (
                    <InactiveUsersActionCell onDelete={openDelDialog(user)} />
                ),
                enableSorting: false,
                meta: { width: 200, align: 'center' },
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [roles],
    );

    const initialState = useMemo(
        () => ({
            sorting: [{ id: 'createdAt', desc: true }],
        }),
        [],
    );

    const table = useReactTable({
        columns,
        data: massagedData,
        initialState,
        defaultColumn: {
            cell: ({ getValue }) => (
                <TextCell value={String(getValue() ?? '')} />
            ),
        },
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        autoResetAll: false,
        enableSortingRemoval: false,
        enableMultiSort: false,
    });

    const rowCount = table.getRowModel().rows.length;

    return (
        <>
            <VirtualizedTable tableInstance={table} />
            <ConditionallyRender
                condition={rowCount === 0}
                show={
                    <TablePlaceholder>
                        No inactive users found.
                    </TablePlaceholder>
                }
            />
            <ConditionallyRender
                condition={Boolean(delUser)}
                show={
                    <DeleteUser
                        showDialog={delDialog}
                        closeDialog={closeDelDialog}
                        user={delUser!}
                        userLoading={usersLoading}
                        removeUser={() => onDeleteUser(delUser!.id)}
                        userApiErrors={userApiErrors}
                    />
                }
            />
        </>
    );
};
