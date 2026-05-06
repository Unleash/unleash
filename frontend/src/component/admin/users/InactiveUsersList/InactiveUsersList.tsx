import {
    type IInactiveUser,
    useInactiveUsers,
} from 'hooks/api/getters/useInactiveUsers/useInactiveUsers';
import { useUsers } from '../../../../hooks/api/getters/useUsers/useUsers.ts';
import useAdminUsersApi from '../../../../hooks/api/actions/useAdminUsersApi/useAdminUsersApi.ts';
import { useInactiveUsersApi } from '../../../../hooks/api/actions/useInactiveUsersApi/useInactiveUsersApi.ts';
import useToast from '../../../../hooks/useToast.tsx';
import { formatUnknownError } from '../../../../utils/formatUnknownError.ts';
import type React from 'react';
import { useMemo, useState } from 'react';
import { TimeAgoCell } from '../../../common/Table/cells/TimeAgoCell/TimeAgoCell.tsx';
import type { IRole } from '../../../../interfaces/role.ts';
import { RoleCell } from '../../../common/Table/cells/RoleCell/RoleCell.tsx';
import { HighlightCell } from '../../../common/Table/cells/HighlightCell/HighlightCell.tsx';
import { PageContent } from '../../../common/PageContent/PageContent.tsx';
import { PageHeader } from '../../../common/PageHeader/PageHeader.tsx';
import { Button } from '@mui/material';
import {
    type ColumnDef,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { ConditionallyRender } from '../../../common/ConditionallyRender/ConditionallyRender.tsx';
import { TablePlaceholder } from '../../../common/Table/index.ts';
import { VirtualizedTable } from '../../../common/Table/VirtualizedTable/VirtualizedTable.tsx';

import { DateCell } from '../../../common/Table/cells/DateCell/DateCell.tsx';
import { InactiveUsersActionCell } from './InactiveUsersActionCell/InactiveUsersActionCell.tsx';
import { TextCell } from '../../../common/Table/cells/TextCell/TextCell.tsx';
import DeleteUser from './DeleteUser/DeleteUser.tsx';
import { DeleteInactiveUsers } from './DeleteInactiveUsers/DeleteInactiveUsers.tsx';
import { Link } from 'react-router-dom';
import { StyledUsersLinkDiv } from '../Users.styles';

type InactiveUserRow = IInactiveUser & { rootRole?: number };

export const InactiveUsersList = () => {
    const { removeUser, userApiErrors } = useAdminUsersApi();
    const { deleteInactiveUsers, errors: inactiveUsersApiErrors } =
        useInactiveUsersApi();
    const { setToastData, setToastApiError } = useToast();
    const { inactiveUsers, refetchInactiveUsers, loading } = useInactiveUsers();
    const { users, roles, loading: usersLoading } = useUsers();
    const [delDialog, setDelDialog] = useState(false);
    const [delUser, setDelUser] = useState<IInactiveUser>();
    const [showDelInactiveDialog, setShowDelInactiveDialog] = useState(false);
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

    const openDelInactiveDialog = (e: React.SyntheticEvent<Element, Event>) => {
        e.preventDefault();
        setShowDelInactiveDialog(true);
    };

    const closeDelInactiveDialog = (): void => {
        setShowDelInactiveDialog(false);
    };

    const onDelInactive = async () => {
        try {
            await deleteInactiveUsers(inactiveUsers.map((i) => i.id));
            setToastData({
                text: `Inactive users has been deleted`,
                type: 'success',
            });
            setShowDelInactiveDialog(false);
            refetchInactiveUsers();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
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
        <PageContent
            isLoading={loading}
            header={
                <PageHeader
                    title={`Inactive users (${rowCount})`}
                    actions={
                        <>
                            <Button
                                variant='contained'
                                color='primary'
                                onClick={openDelInactiveDialog}
                                disabled={inactiveUsers.length === 0}
                            >
                                Delete all inactive users
                            </Button>
                        </>
                    }
                />
            }
        >
            <StyledUsersLinkDiv>
                <Link to={'/admin/users'}>View all users</Link>
            </StyledUsersLinkDiv>
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
            <DeleteInactiveUsers
                showDialog={showDelInactiveDialog}
                closeDialog={closeDelInactiveDialog}
                inactiveUsersLoading={loading}
                inactiveUserApiErrors={inactiveUsersApiErrors}
                inactiveUsers={inactiveUsers}
                removeInactiveUsers={onDelInactive}
            />
        </PageContent>
    );
};
