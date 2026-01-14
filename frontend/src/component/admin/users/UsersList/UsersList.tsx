import { useMemo, useState } from 'react';
import { TablePlaceholder, VirtualizedTable } from 'component/common/Table';
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
import { useFlexLayout, useSortBy, useTable } from 'react-table';
import { sortTypes } from 'utils/sortTypes';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { Link, useNavigate } from 'react-router-dom';
import { DateCell } from 'component/common/Table/cells/DateCell/DateCell';
import theme from 'themes/theme';
import { TimeAgoCell } from 'component/common/Table/cells/TimeAgoCell/TimeAgoCell';
import { UsersActionsCell } from './UsersActionsCell/UsersActionsCell.tsx';
import { Search } from 'component/common/Search/Search';
import { UserAvatar } from 'component/common/UserAvatar/UserAvatar';
import { useConditionallyHiddenColumns } from 'hooks/useConditionallyHiddenColumns';
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

const UsersList = () => {
    const navigate = useNavigate();
    const { isEnterprise, isOss, uiConfig: { resourceLimits } } = useUiConfig();
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

    const showSeatTypes = useUiFlag('readOnlyUsersUI') && resourceLimits.readOnlyUsers;

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
                disableSortBy: true,
                maxWidth: 80,
            },
            {
                id: 'name',
                Header: 'Name',
                accessor: (row: any) => row.name || '',
                minWidth: 180,
                Cell: ({ row: { original: user } }: any) => (
                    <HighlightCell
                        value={user.name}
                        subtitle={user.email || user.username}
                    />
                ),
                searchable: true,
            },
            ...(showUserDeviceCount
                ? [
                      {
                          id: 'warning',
                          Header: ' ',
                          accessor: (row: any) => row.name || '',
                          maxWidth: 40,
                          Cell: ({ row: { original: user } }: any) => (
                              <UserSessionsCell count={user.activeSessions} />
                          ),
                          searchable: false,
                          disableSortBy: true,
                      },
                  ]
                : []),
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
                accessor: 'seenAt',
                Cell: TimeAgoCell,
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
                sortType: 'boolean',
            },
            {
                id: 'seatType',
                Header: 'Seat type',
                accessor: 'seatType',
                maxWidth: 100,
                sortType: 'boolean',
                Cell: TextCell,
            },
            {
                Header: '',
                id: 'Actions',
                align: 'center',
                Cell: ({
                    row: { original: user },
                }: {
                    row: { original: IUser };
                }) => (
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
                width: 80,
                disableSortBy: true,
            },
            // Always hidden -- for search
            {
                accessor: 'username',
                Header: 'Username',
                searchable: true,
            },
            // Always hidden -- for search
            {
                accessor: 'email',
                Header: 'Email',
                searchable: true,
            },
        ],
        [roles, navigate, isBillingUsers, showSeatTypes],
    );

    const initialState = useMemo(() => {
        return {
            sortBy: [{ id: 'createdAt', desc: true }],
            hiddenColumns: [
                'username',
                'email',
                ...(isBillingUsers ? [] : ['type']),
                ...(showSeatTypes ? [] : ['seatType']),
            ],
        };
    }, [isBillingUsers, showSeatTypes]);

    const { data, getSearchText } = useSearch(
        columns,
        searchValue,
        isBillingUsers ? planUsers : users,
    );

    const { headerGroups, rows, prepareRow, setHiddenColumns } = useTable(
        {
            columns: columns as any,
            data,
            initialState,
            sortTypes,
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

    useConditionallyHiddenColumns(
        [
            {
                condition: !isBillingUsers || isSmallScreen,
                columns: ['type'],
            },
            {
                condition: !showSeatTypes || isSmallScreen,
                columns: ['seatType'],
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
        setHiddenColumns,
        columns,
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
            <SearchHighlightProvider value={getSearchText(searchValue)}>
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
