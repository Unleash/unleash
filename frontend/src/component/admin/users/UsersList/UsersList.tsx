import React, { useMemo, useState } from 'react';
import { TablePlaceholder, VirtualizedTable } from 'component/common/Table';
import ChangePassword from './ChangePassword/ChangePassword';
import DeleteUser from './DeleteUser/DeleteUser';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import ConfirmUserAdded from '../ConfirmUserAdded/ConfirmUserAdded';
import { useUsers } from 'hooks/api/getters/useUsers/useUsers';
import useAdminUsersApi from 'hooks/api/actions/useAdminUsersApi/useAdminUsersApi';
import { IUser } from 'interfaces/user';
import { IRole } from 'interfaces/role';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useUsersPlan } from 'hooks/useUsersPlan';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { Button, useMediaQuery } from '@mui/material';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { UserTypeCell } from './UserTypeCell/UserTypeCell';
import {
    useFlexLayout,
    useGlobalFilter,
    useSortBy,
    useTable,
} from 'react-table';
import { sortTypes } from 'utils/sortTypes';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { useNavigate } from 'react-router-dom';
import { DateCell } from 'component/common/Table/cells/DateCell/DateCell';
import theme from 'themes/theme';
import { TimeAgoCell } from 'component/common/Table/cells/TimeAgoCell/TimeAgoCell';
import { UsersActionsCell } from './UsersActionsCell/UsersActionsCell';
import { Search } from 'component/common/Search/Search';
import { UserAvatar } from 'component/common/UserAvatar/UserAvatar';
import { useConditionallyHiddenColumns } from 'hooks/useConditionallyHiddenColumns';
import { UserLimitWarning } from './UserLimitWarning/UserLimitWarning';
import { RoleCell } from 'component/common/Table/cells/RoleCell/RoleCell';

const UsersList = () => {
    const navigate = useNavigate();
    const { users, roles, refetch, loading } = useUsers();
    const { setToastData, setToastApiError } = useToast();
    const { removeUser, userLoading, userApiErrors } = useAdminUsersApi();
    const [pwDialog, setPwDialog] = useState<{ open: boolean; user?: IUser }>({
        open: false,
    });
    const [delDialog, setDelDialog] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [inviteLink, setInviteLink] = useState('');
    const [delUser, setDelUser] = useState<IUser>();
    const { planUsers, isBillingUsers } = useUsersPlan(users);

    const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    const closeDelDialog = () => {
        setDelDialog(false);
        setDelUser(undefined);
    };

    const openDelDialog =
        (user: IUser) => (e: React.SyntheticEvent<Element, Event>) => {
            e.preventDefault();
            setDelDialog(true);
            setDelUser(user);
        };
    const openPwDialog =
        (user: IUser) => (e: React.SyntheticEvent<Element, Event>) => {
            e.preventDefault();
            setPwDialog({ open: true, user });
        };

    const closePwDialog = () => {
        setPwDialog({ open: false });
    };

    const onDeleteUser = async (user: IUser) => {
        try {
            await removeUser(user.id);
            setToastData({
                title: `${user.name} has been deleted`,
                type: 'success',
            });
            refetch();
            closeDelDialog();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const closeConfirm = () => {
        setShowConfirm(false);
        setEmailSent(false);
        setInviteLink('');
    };

    const columns = useMemo(
        () => [
            {
                Header: 'Avatar',
                accessor: 'imageUrl',
                Cell: ({ row: { original: user } }: any) => (
                    <TextCell>
                        <UserAvatar user={user} />
                    </TextCell>
                ),
                disableGlobalFilter: true,
                disableSortBy: true,
                maxWidth: 80,
            },
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
            },
            {
                id: 'role',
                Header: 'Role',
                accessor: (row: any) =>
                    roles.find((role: IRole) => role.id === row.rootRole)
                        ?.name || '',
                Cell: ({ row: { original: user }, value }: any) => (
                    <RoleCell value={value} roleId={user.rootRole} />
                ),
                disableGlobalFilter: true,
                maxWidth: 120,
            },
            {
                Header: 'Created',
                accessor: 'createdAt',
                Cell: DateCell,
                disableGlobalFilter: true,
                sortType: 'date',
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
                        emptyText="Never"
                        title={date => `Last login: ${date}`}
                    />
                ),
                disableGlobalFilter: true,
                sortType: 'date',
                maxWidth: 150,
            },
            {
                id: 'type',
                Header: 'Type',
                accessor: 'paid',
                maxWidth: 100,
                Cell: ({ row: { original: user } }: any) => (
                    <UserTypeCell value={isBillingUsers && user.paid} />
                ),
                disableGlobalFilter: true,
                sortType: 'boolean',
            },
            {
                Header: 'Actions',
                id: 'Actions',
                align: 'center',
                Cell: ({ row: { original: user } }: any) => (
                    <UsersActionsCell
                        onEdit={() => {
                            navigate(`/admin/users/${user.id}/edit`);
                        }}
                        onChangePassword={openPwDialog(user)}
                        onDelete={openDelDialog(user)}
                    />
                ),
                width: 150,
                disableGlobalFilter: true,
                disableSortBy: true,
            },
        ],
        [roles, navigate, isBillingUsers]
    );

    const initialState = useMemo(() => {
        return {
            sortBy: [{ id: 'createdAt' }],
            hiddenColumns: isBillingUsers ? [] : ['type'],
        };
    }, [isBillingUsers]);

    const data = isBillingUsers ? planUsers : users;

    const {
        headerGroups,
        rows,
        prepareRow,
        state: { globalFilter },
        setGlobalFilter,
        setHiddenColumns,
    } = useTable(
        {
            columns: columns as any,
            data,
            initialState,
            sortTypes,
            autoResetGlobalFilter: false,
            autoResetHiddenColumns: false,
            autoResetSortBy: false,
            disableSortRemove: true,
            defaultColumn: {
                Cell: TextCell,
            },
        },
        useGlobalFilter,
        useSortBy,
        useFlexLayout
    );

    useConditionallyHiddenColumns(
        [
            {
                condition: !isBillingUsers || isSmallScreen,
                columns: ['type'],
            },
            {
                condition: isExtraSmallScreen,
                columns: ['imageUrl', 'role'],
            },
            {
                condition: isSmallScreen,
                columns: ['createdAt', 'last-login'],
            },
        ],
        setHiddenColumns,
        columns
    );

    return (
        <PageContent
            isLoading={loading}
            header={
                <PageHeader
                    title={`Users (${rows.length})`}
                    actions={
                        <>
                            <Search
                                initialValue={globalFilter}
                                onChange={setGlobalFilter}
                            />
                            <PageHeader.Divider />
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => navigate('/admin/create-user')}
                            >
                                Add new user
                            </Button>
                        </>
                    }
                />
            }
        >
            <UserLimitWarning />
            <SearchHighlightProvider value={globalFilter}>
                <VirtualizedTable
                    rows={rows}
                    headerGroups={headerGroups}
                    prepareRow={prepareRow}
                />
            </SearchHighlightProvider>
            <ConditionallyRender
                condition={rows.length === 0}
                show={
                    <ConditionallyRender
                        condition={globalFilter?.length > 0}
                        show={
                            <TablePlaceholder>
                                No users found matching &ldquo;
                                {globalFilter}
                                &rdquo;
                            </TablePlaceholder>
                        }
                        elseShow={
                            <TablePlaceholder>
                                No users available. Get started by adding one.
                            </TablePlaceholder>
                        }
                    />
                }
            />

            <ConfirmUserAdded
                open={showConfirm}
                closeConfirm={closeConfirm}
                emailSent={emailSent}
                inviteLink={inviteLink}
            />

            <ConditionallyRender
                condition={Boolean(pwDialog.user)}
                show={() => (
                    <ChangePassword
                        showDialog={pwDialog.open}
                        closeDialog={closePwDialog}
                        user={pwDialog.user!}
                    />
                )}
            />
            <ConditionallyRender
                condition={Boolean(delUser)}
                show={
                    <DeleteUser
                        showDialog={delDialog}
                        closeDialog={closeDelDialog}
                        user={delUser!}
                        removeUser={() => onDeleteUser(delUser!)}
                        userLoading={userLoading}
                        userApiErrors={userApiErrors}
                    />
                }
            />
        </PageContent>
    );
};

export default UsersList;
