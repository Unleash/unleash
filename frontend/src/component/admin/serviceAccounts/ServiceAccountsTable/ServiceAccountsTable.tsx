import { useMemo, useState } from 'react';
import { TablePlaceholder, VirtualizedTable } from 'component/common/Table';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { IRole } from 'interfaces/role';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { Button, useMediaQuery } from '@mui/material';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { useFlexLayout, useSortBy, useTable } from 'react-table';
import { sortTypes } from 'utils/sortTypes';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { DateCell } from 'component/common/Table/cells/DateCell/DateCell';
import theme from 'themes/theme';
import { Search } from 'component/common/Search/Search';
import { UserAvatar } from 'component/common/UserAvatar/UserAvatar';
import { useConditionallyHiddenColumns } from 'hooks/useConditionallyHiddenColumns';
import { useSearch } from 'hooks/useSearch';
import { useServiceAccounts } from 'hooks/api/getters/useServiceAccounts/useServiceAccounts';
import { useServiceAccountsApi } from 'hooks/api/actions/useServiceAccountsApi/useServiceAccountsApi';
import { ServiceAccountModal } from './ServiceAccountModal/ServiceAccountModal';
import { ServiceAccountDeleteDialog } from './ServiceAccountDeleteDialog/ServiceAccountDeleteDialog';
import { ServiceAccountsActionsCell } from './ServiceAccountsActionsCell/ServiceAccountsActionsCell';
import { INewPersonalAPIToken } from 'interfaces/personalAPIToken';
import { ServiceAccountTokenDialog } from './ServiceAccountTokenDialog/ServiceAccountTokenDialog';
import { ServiceAccountTokensCell } from './ServiceAccountTokensCell/ServiceAccountTokensCell';
import { TimeAgoCell } from 'component/common/Table/cells/TimeAgoCell/TimeAgoCell';
import { IServiceAccount } from 'interfaces/service-account';
import { RoleCell } from 'component/common/Table/cells/RoleCell/RoleCell';

export const ServiceAccountsTable = () => {
    const { setToastData, setToastApiError } = useToast();

    const { serviceAccounts, roles, refetch, loading } = useServiceAccounts();
    const { removeServiceAccount } = useServiceAccountsApi();

    const [searchValue, setSearchValue] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [tokenDialog, setTokenDialog] = useState(false);
    const [newToken, setNewToken] = useState<INewPersonalAPIToken>();
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedServiceAccount, setSelectedServiceAccount] =
        useState<IServiceAccount>();

    const onDeleteConfirm = async (serviceAccount: IServiceAccount) => {
        try {
            await removeServiceAccount(serviceAccount.id);
            setToastData({
                title: `${serviceAccount.name} has been deleted`,
                type: 'success',
            });
            refetch();
            setDeleteOpen(false);
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    const columns = useMemo(
        () => [
            {
                Header: 'Avatar',
                accessor: 'imageUrl',
                Cell: ({ row: { original: serviceAccount } }: any) => (
                    <TextCell>
                        <UserAvatar user={serviceAccount} />
                    </TextCell>
                ),
                disableSortBy: true,
                maxWidth: 80,
            },
            {
                id: 'name',
                Header: 'Name',
                accessor: (row: any) => row.name || '',
                minWidth: 200,
                Cell: ({ row: { original: serviceAccount } }: any) => (
                    <HighlightCell
                        value={serviceAccount.name}
                        subtitle={serviceAccount.username}
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
                Cell: ({ row: { original: serviceAccount }, value }: any) => (
                    <RoleCell value={value} roleId={serviceAccount.rootRole} />
                ),
                maxWidth: 120,
            },
            {
                id: 'tokens',
                Header: 'Tokens',
                accessor: (row: IServiceAccount) =>
                    row.tokens
                        ?.map(({ description }) => description)
                        .join('\n') || '',
                Cell: ({
                    row: { original: serviceAccount },
                    value,
                }: {
                    row: { original: IServiceAccount };
                    value: string;
                }) => (
                    <ServiceAccountTokensCell
                        serviceAccount={serviceAccount}
                        value={value}
                        onCreateToken={() => {
                            setSelectedServiceAccount(serviceAccount);
                            setModalOpen(true);
                        }}
                    />
                ),
                searchable: true,
            },
            {
                Header: 'Created',
                accessor: 'createdAt',
                Cell: DateCell,
                sortType: 'date',
                width: 120,
                maxWidth: 120,
            },
            {
                id: 'seenAt',
                Header: 'Last seen',
                accessor: (row: IServiceAccount) =>
                    row.tokens.sort((a, b) => {
                        const aSeenAt = new Date(a.seenAt || 0);
                        const bSeenAt = new Date(b.seenAt || 0);
                        return bSeenAt?.getTime() - aSeenAt?.getTime();
                    })[0]?.seenAt,
                Cell: TimeAgoCell,
                sortType: 'date',
                maxWidth: 150,
            },
            {
                Header: 'Actions',
                id: 'Actions',
                align: 'center',
                Cell: ({ row: { original: serviceAccount } }: any) => (
                    <ServiceAccountsActionsCell
                        onEdit={() => {
                            setSelectedServiceAccount(serviceAccount);
                            setModalOpen(true);
                        }}
                        onDelete={() => {
                            setSelectedServiceAccount(serviceAccount);
                            setDeleteOpen(true);
                        }}
                    />
                ),
                width: 150,
                disableSortBy: true,
            },
            // Always hidden -- for search
            {
                accessor: 'username',
                Header: 'Username',
                searchable: true,
            },
        ],
        [roles]
    );

    const [initialState] = useState({
        sortBy: [{ id: 'createdAt' }],
        hiddenColumns: ['username'],
    });

    const { data, getSearchText } = useSearch(
        columns,
        searchValue,
        serviceAccounts
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
        useFlexLayout
    );

    useConditionallyHiddenColumns(
        [
            {
                condition: isExtraSmallScreen,
                columns: ['role', 'seenAt'],
            },
            {
                condition: isSmallScreen,
                columns: ['imageUrl', 'tokens', 'createdAt'],
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
                    title={`Service Accounts (${rows.length})`}
                    actions={
                        <>
                            <ConditionallyRender
                                condition={!isSmallScreen}
                                show={
                                    <>
                                        <Search
                                            initialValue={searchValue}
                                            onChange={setSearchValue}
                                        />
                                        <PageHeader.Divider />
                                    </>
                                }
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => {
                                    setSelectedServiceAccount(undefined);
                                    setModalOpen(true);
                                }}
                            >
                                New service account
                            </Button>
                        </>
                    }
                >
                    <ConditionallyRender
                        condition={isSmallScreen}
                        show={
                            <Search
                                initialValue={searchValue}
                                onChange={setSearchValue}
                            />
                        }
                    />
                </PageHeader>
            }
        >
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
                                No service accounts found matching &ldquo;
                                {searchValue}
                                &rdquo;
                            </TablePlaceholder>
                        }
                        elseShow={
                            <TablePlaceholder>
                                No service accounts available. Get started by
                                adding one.
                            </TablePlaceholder>
                        }
                    />
                }
            />
            <ServiceAccountModal
                serviceAccount={selectedServiceAccount}
                open={modalOpen}
                setOpen={setModalOpen}
                newToken={(token: INewPersonalAPIToken) => {
                    setNewToken(token);
                    setTokenDialog(true);
                }}
            />
            <ServiceAccountTokenDialog
                open={tokenDialog}
                setOpen={setTokenDialog}
                token={newToken}
            />
            <ServiceAccountDeleteDialog
                serviceAccount={selectedServiceAccount}
                open={deleteOpen}
                setOpen={setDeleteOpen}
                onConfirm={onDeleteConfirm}
            />
        </PageContent>
    );
};
