import {
    type IInactiveUser,
    useInactiveUsers,
} from 'hooks/api/getters/useInactiveUsers/useInactiveUsers';
import { useUsers } from '../../../../hooks/api/getters/useUsers/useUsers';
import useAdminUsersApi from '../../../../hooks/api/actions/useAdminUsersApi/useAdminUsersApi';
import { useInactiveUsersApi } from '../../../../hooks/api/actions/useInactiveUsersApi/useInactiveUsersApi';
import useToast from '../../../../hooks/useToast';
import { formatUnknownError } from '../../../../utils/formatUnknownError';
import type { IUser } from '../../../../interfaces/user';
import type React from 'react';
import { useMemo, useState } from 'react';
import { TimeAgoCell } from '../../../common/Table/cells/TimeAgoCell/TimeAgoCell';
import type { IRole } from '../../../../interfaces/role';
import { RoleCell } from '../../../common/Table/cells/RoleCell/RoleCell';
import { HighlightCell } from '../../../common/Table/cells/HighlightCell/HighlightCell';
import { PageContent } from '../../../common/PageContent/PageContent';
import { PageHeader } from '../../../common/PageHeader/PageHeader';
import { Button } from '@mui/material';
import { useFlexLayout, useSortBy, useTable } from 'react-table';
import { ConditionallyRender } from '../../../common/ConditionallyRender/ConditionallyRender';
import { TablePlaceholder, VirtualizedTable } from '../../../common/Table';

import { DateCell } from '../../../common/Table/cells/DateCell/DateCell';
import { InactiveUsersActionCell } from './InactiveUsersActionCell/InactiveUsersActionCell';
import { TextCell } from '../../../common/Table/cells/TextCell/TextCell';
import DeleteUser from './DeleteUser/DeleteUser';
import { DeleteInactiveUsers } from './DeleteInactiveUsers/DeleteInactiveUsers';
import { Link } from 'react-router-dom';
import { StyledUsersLinkDiv } from '../Users.styles';

export const InactiveUsersList = () => {
    const { removeUser, userApiErrors } = useAdminUsersApi();
    const { deleteInactiveUsers, errors: inactiveUsersApiErrors } =
        useInactiveUsersApi();
    const { setToastData, setToastApiError } = useToast();
    const { inactiveUsers, refetchInactiveUsers, loading, error } =
        useInactiveUsers();
    const {
        users,
        roles,
        loading: usersLoading,
        refetch,
        error: usersError,
    } = useUsers();
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
                title: `Inactive users has been deleted`,
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
                title: `User has been deleted`,
                type: 'success',
            });
            refetchInactiveUsers();
            closeDelDialog();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };
    const massagedData = useMemo(
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
    const columns = useMemo(
        () => [
            {
                id: 'name',
                Header: 'Name',
                accessor: (row: any) => row.name || '',
                minWidth: 200,
                Cell: ({ row: { original: user } }: any) => (
                    <HighlightCell
                        value={user.name}
                        subtitle={user.email || user.username}
                    />
                ),
                searchable: true,
            },
            {
                id: 'role',
                Header: 'Role',
                accessor: (row: any) =>
                    roles.find((role: IRole) => role.id === row.rootRole)
                        ?.name || '',
                Cell: ({
                    row: { original: user },
                    value,
                }: {
                    row: { original: IUser };
                    value: string;
                }) => <RoleCell value={value} role={user.rootRole} />,
                maxWidth: 120,
            },
            {
                Header: 'Created',
                accessor: 'createdAt',
                Cell: DateCell,
                width: 120,
                maxWidth: 120,
            },
            {
                id: 'last-login',
                Header: 'Last login',
                accessor: (row: any) => row.seenAt || '',
                Cell: ({ row: { original: user } }: any) => (
                    <TimeAgoCell
                        value={user.seenAt}
                        emptyText='Never'
                        title={(date) => `Last login: ${date}`}
                    />
                ),
                maxWidth: 150,
            },
            {
                id: 'pat-last-login',
                Header: 'PAT last used',
                accessor: (row: any) => row.patSeenAt || '',
                Cell: ({ row: { original: user } }: any) => (
                    <TimeAgoCell
                        value={user.patSeenAt}
                        emptyText='Never'
                        title={(date) => `Last used: ${date}`}
                    />
                ),
                maxWidth: 150,
            },
            {
                id: 'Actions',
                Header: 'Actions',
                align: 'center',
                Cell: ({ row: { original: user } }: any) => (
                    <InactiveUsersActionCell onDelete={openDelDialog(user)} />
                ),
                width: 200,
                disableSortBy: true,
            },
        ],
        [roles],
    );
    const initialState = useMemo(() => {
        return {
            sortBy: [{ id: 'createdAt', desc: true }],
            hiddenColumns: ['username', 'email'],
        };
    }, []);

    const { headerGroups, rows, prepareRow } = useTable(
        {
            columns: columns as any,
            data: massagedData,
            initialState,
            autoResetHiddenColumns: false,
            autoResetSortBy: false,
            disableSortRemove: true,
            disableMultiSort: true,
            defaultColumn: {
                Cell: TextCell,
            },
        },
        useSortBy,
        useFlexLayout,
    );

    return (
        <PageContent
            isLoading={loading}
            header={
                <PageHeader
                    title={`Inactive users (${rows.length})`}
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
            <VirtualizedTable
                rows={rows}
                headerGroups={headerGroups}
                prepareRow={prepareRow}
            />
            <ConditionallyRender
                condition={rows.length === 0}
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
