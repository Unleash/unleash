import { useMemo, useState } from 'react';
import { TablePlaceholder } from 'component/common/Table';
import { VirtualizedTableV8 } from 'component/common/Table/VirtualizedTable/VirtualizedTableV8';
import ChangePassword from './ChangePassword/ChangePassword.tsx';
import ResetPassword from './ResetPassword/ResetPassword.tsx';
import DeleteUser from './DeleteUser/DeleteUser.tsx';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import ConfirmUserAdded from '../ConfirmUserAdded/ConfirmUserAdded.tsx';
import { useUsers } from 'hooks/api/getters/useUsers/useUsers';
import useAdminUsersApi from 'hooks/api/actions/useAdminUsersApi/useAdminUsersApi';
import { useAccessOverviewApi } from 'hooks/api/actions/useAccessOverviewApi/useAccessOverviewApi';
import type { IUser } from 'interfaces/user';
import type { IRole } from 'interfaces/role';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useUsersPlan } from 'hooks/useUsersPlan';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { Button, IconButton, Tooltip, useMediaQuery } from '@mui/material';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { UserTypeCell } from './UserTypeCell/UserTypeCell.tsx';
import {
    type ColumnDef,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { sortingFns } from 'utils/sortingFns';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { Link, useNavigate } from 'react-router-dom';
import { DateCell } from 'component/common/Table/cells/DateCell/DateCell';
import theme from 'themes/theme';
import { TimeAgoCell } from 'component/common/Table/cells/TimeAgoCell/TimeAgoCell';
import { UsersActionsCell } from './UsersActionsCell/UsersActionsCell.tsx';
import { Search } from 'component/common/Search/Search';
import { UserAvatar } from 'component/common/UserAvatar/UserAvatar';
import { useConditionallyHiddenColumnsV8 } from 'hooks/useConditionallyHiddenColumnsV8';
import { UserLimitWarning } from './UserLimitWarning/UserLimitWarning.tsx';
import { RoleCell } from 'component/common/Table/cells/RoleCell/RoleCell';
import { useSearch } from 'hooks/useSearch';
import Download from '@mui/icons-material/Download';
import { StyledUsersLinkDiv } from '../Users.styles';
import { useUiFlag } from 'hooks/useUiFlag';
import useUiConfig from '../../../../hooks/api/getters/useUiConfig/useUiConfig.ts';
import { useScimSettings } from 'hooks/api/getters/useScimSettings/useScimSettings';
import { UserSessionsCell } from './UserSessionsCell/UserSessionsCell.tsx';
import { UsersHeader } from '../UsersHeader/UsersHeader.tsx';
import { UpgradeSSO } from './UpgradeSSO.tsx';
import { AccessRequestsTable } from './AccessRequestsTable/AccessRequestsTable.tsx';

const UsersList = () => {
    const navigate = useNavigate();
    const { isEnterprise, isOss } = useUiConfig();
    const { users, roles, refetch, loading } = useUsers();
    const { setToastData, setToastApiError } = useToast();
    const { removeUser, userLoading, userApiErrors } = useAdminUsersApi();
    const { downloadCSV } = useAccessOverviewApi();
    const [pwDialog, setPwDialog] = useState<{ open: boolean; user?: IUser }>({
        open: false,
    });
    const [resetPwDialog, setResetPwDialog] = useState<{
        open: boolean;
        user?: IUser;
    }>({
        open: false,
    });
    const showUserDeviceCount = useUiFlag('showUserDeviceCount');
    const showSSOUpgrade = isOss() && users.length > 3;

    const {
        settings: { enabled: scimEnabled },
    } = useScimSettings();
    const [delDialog, setDelDialog] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [inviteLink, setInviteLink] = useState('');
    const [delUser, setDelUser] = useState<IUser>();
    const { planUsers, isBillingUsers } = useUsersPlan(users);

    const [searchValue, setSearchValue] = useState('');

    const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const closeDelDialog = () => {
        setDelDialog(false);
        setDelUser(undefined);
    };

    const openDelDialog = (user: IUser) => () => {
        setDelDialog(true);
        setDelUser(user);
    };
    const openPwDialog = (user: IUser) => () => {
        setPwDialog({ open: true, user });
    };

    const openResetPwDialog = (user: IUser) => () => {
        setResetPwDialog({ open: true, user });
    };

    const closePwDialog = () => {
        setPwDialog({ open: false });
    };

    const closeResetPwDialog = () => {
        setResetPwDialog({ open: false });
    };

    const onDeleteUser = async (user: IUser) => {
        try {
            await removeUser(user.id);
            setToastData({
                text: `${user.name} has been deleted`,
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

    const columns = useMemo<ColumnDef<IUser, unknown>[]>(
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
                meta: { maxWidth: 80 },
            },
            {
                id: 'name',
                header: 'Name',
                accessorFn: (row) => row.name || '',
                cell: ({ row: { original: user } }) => (
                    <HighlightCell
                        value={user.name ?? ''}
                        subtitle={user.email || user.username}
                    />
                ),
                meta: { minWidth: 180, searchable: true },
            },
            ...(showUserDeviceCount
                ? [
                      {
                          id: 'warning',
                          header: ' ',
                          accessorFn: (row: IUser) => row.name || '',
                          cell: ({ row: { original: user } }) => (
                              <UserSessionsCell count={user.activeSessions} />
                          ),
                          enableSorting: false,
                          meta: { maxWidth: 40 },
                      } satisfies ColumnDef<IUser, unknown>,
                  ]
                : []),
            {
                id: 'role',
                header: 'Role',
                accessorFn: (row) =>
                    roles.find((role: IRole) => role.id === row.rootRole)
                        ?.name || '',
                cell: ({ getValue, row: { original: user } }) => (
                    <RoleCell
                        value={String(getValue() ?? '')}
                        role={user.rootRole}
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
                id: 'type',
                header: 'Type',
                accessorKey: 'paid',
                cell: ({ row: { original: user } }) => (
                    <UserTypeCell
                        value={Boolean(isBillingUsers && user.paid)}
                    />
                ),
                sortingFn: sortingFns.boolean,
                meta: { maxWidth: 100 },
            },
            {
                id: 'Actions',
                header: '',
                cell: ({ row: { original: user } }) => (
                    <UsersActionsCell
                        onEdit={() => {
                            navigate(`/admin/users/${user.id}/edit`);
                        }}
                        onViewAccess={() => {
                            navigate(`/admin/users/${user.id}/access`);
                        }}
                        onChangePassword={openPwDialog(user)}
                        onResetPassword={openResetPwDialog(user)}
                        onDelete={openDelDialog(user)}
                        isScimUser={scimEnabled && Boolean(user.scimId)}
                        userId={user.id}
                    />
                ),
                enableSorting: false,
                meta: { width: 80, align: 'center' },
            },
            // Always hidden -- for search
            {
                id: 'username',
                header: 'Username',
                accessorKey: 'username',
                meta: { searchable: true },
            },
            {
                id: 'email',
                header: 'Email',
                accessorKey: 'email',
                meta: { searchable: true },
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [roles, navigate, isBillingUsers, showUserDeviceCount, scimEnabled],
    );

    const initialState = useMemo(() => {
        const hidden: Record<string, boolean> = {
            username: false,
            email: false,
        };
        if (!isBillingUsers) {
            hidden.type = false;
        }
        return {
            sorting: [{ id: 'createdAt', desc: true }],
            columnVisibility: hidden,
        };
    }, [isBillingUsers]);

    const { data, getSearchText } = useSearch(
        columns,
        searchValue,
        isBillingUsers ? planUsers : users,
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

    useConditionallyHiddenColumnsV8(
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
                columns: ['createdAt', 'last-login', 'warning'],
            },
        ],
        table.setColumnVisibility,
        columns,
    );

    const rowCount = table.getRowModel().rows.length;

    return (
        <PageContent
            isLoading={loading}
            header={
                <PageHeader
                    title={`Users (${rowCount})`}
                    actions={
                        <>
                            <Search
                                initialValue={searchValue}
                                onChange={setSearchValue}
                            />
                            <PageHeader.Divider />
                            <Tooltip
                                title='Exports user access information'
                                arrow
                                describeChild
                            >
                                <IconButton onClick={downloadCSV}>
                                    <Download />
                                </IconButton>
                            </Tooltip>
                            <Button
                                variant='contained'
                                color='primary'
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
            <ConditionallyRender
                condition={isEnterprise()}
                show={
                    <StyledUsersLinkDiv>
                        <Link to='/admin/users/inactive'>
                            View inactive users
                        </Link>
                    </StyledUsersLinkDiv>
                }
            />
            <UsersHeader />
            <AccessRequestsTable />
            <SearchHighlightProvider value={getSearchText(searchValue)}>
                <VirtualizedTableV8 tableInstance={table} />
            </SearchHighlightProvider>

            <ConditionallyRender
                condition={rowCount === 0}
                show={
                    <ConditionallyRender
                        condition={searchValue?.length > 0}
                        show={
                            <TablePlaceholder>
                                No users found matching &ldquo;
                                {searchValue}
                                &rdquo;
                            </TablePlaceholder>
                        }
                        elseShow={
                            <TablePlaceholder>
                                <span data-loading>
                                    No users available. Get started by adding
                                    one.
                                </span>
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
                condition={Boolean(resetPwDialog.user)}
                show={() => (
                    <ResetPassword
                        showDialog={resetPwDialog.open}
                        closeDialog={closeResetPwDialog}
                        user={resetPwDialog.user!}
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

            {showSSOUpgrade ? <UpgradeSSO /> : null}
        </PageContent>
    );
};

export default UsersList;
