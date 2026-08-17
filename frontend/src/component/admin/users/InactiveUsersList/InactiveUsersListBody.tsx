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
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { useSearch } from 'hooks/useSearch';
import { DateCell } from 'component/common/Table/cells/DateCell/DateCell';
import { InactiveUsersActionCell } from './InactiveUsersActionCell/InactiveUsersActionCell.tsx';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import DeleteUser from './DeleteUser/DeleteUser.tsx';

type InactiveUserRow = IInactiveUser & { rootRole?: number };

interface IInactiveUsersListBodyProps {
    searchValue: string;
}

export const InactiveUsersListBody = ({
    searchValue,
}: IInactiveUsersListBodyProps) => {
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
                meta: { minWidth: 200, searchable: true },
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
            // Always hidden -- for search
            {
                id: 'email',
                header: 'Email',
                accessorKey: 'email',
                meta: { searchable: true },
            },
            {
                id: 'username',
                header: 'Username',
                accessorKey: 'username',
                meta: { searchable: true },
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [roles],
    );

    const initialState = useMemo(
        () => ({
            sorting: [{ id: 'createdAt', desc: true }],
            columnVisibility: { email: false, username: false },
        }),
        [],
    );

    const { data, getSearchText } = useSearch(
        columns,
        searchValue,
        massagedData,
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
        autoResetAll: false,
        enableSortingRemoval: false,
        enableMultiSort: false,
    });

    const rowCount = table.getRowModel().rows.length;

    return (
        <>
            <SearchHighlightProvider value={getSearchText(searchValue)}>
                <VirtualizedTable tableInstance={table} />
            </SearchHighlightProvider>
            <ConditionallyRender
                condition={rowCount === 0}
                show={
                    <ConditionallyRender
                        condition={searchValue?.length > 0}
                        show={
                            <TablePlaceholder>
                                No inactive users found matching &ldquo;
                                {searchValue}
                                &rdquo;
                            </TablePlaceholder>
                        }
                        elseShow={
                            <TablePlaceholder>
                                No inactive users found.
                            </TablePlaceholder>
                        }
                    />
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
