import { useMemo, useState } from 'react';
import { TablePlaceholder } from 'component/common/Table';
import { VirtualizedTableV8 } from 'component/common/Table/VirtualizedTable/VirtualizedTableV8';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import type { IRole } from 'interfaces/role';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { Button, useMediaQuery } from '@mui/material';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import {
    type ColumnDef,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { DateCell } from 'component/common/Table/cells/DateCell/DateCell';
import theme from 'themes/theme';
import { Search } from 'component/common/Search/Search';
import { UserAvatar } from 'component/common/UserAvatar/UserAvatar';
import { useConditionallyHiddenColumnsV8 } from 'hooks/useConditionallyHiddenColumnsV8';
import { useSearch } from 'hooks/useSearch';
import { useServiceAccounts } from 'hooks/api/getters/useServiceAccounts/useServiceAccounts';
import { useServiceAccountsApi } from 'hooks/api/actions/useServiceAccountsApi/useServiceAccountsApi';
import { ServiceAccountModal } from './ServiceAccountModal/ServiceAccountModal.tsx';
import { ServiceAccountDeleteDialog } from './ServiceAccountDeleteDialog/ServiceAccountDeleteDialog.tsx';
import { ServiceAccountsActionsCell } from './ServiceAccountsActionsCell/ServiceAccountsActionsCell.tsx';
import type { INewPersonalAPIToken } from 'interfaces/personalAPIToken';
import { ServiceAccountTokenDialog } from './ServiceAccountTokenDialog/ServiceAccountTokenDialog.tsx';
import { ServiceAccountTokensCell } from './ServiceAccountTokensCell/ServiceAccountTokensCell.tsx';
import { TimeAgoCell } from 'component/common/Table/cells/TimeAgoCell/TimeAgoCell';
import type { IServiceAccount } from 'interfaces/service-account';
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
                text: `${serviceAccount.name} has been deleted`,
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

    const columns = useMemo<ColumnDef<IServiceAccount, unknown>[]>(
        () => [
            {
                id: 'imageUrl',
                header: 'Avatar',
                accessorKey: 'imageUrl',
                cell: ({ row: { original: serviceAccount } }) => (
                    <TextCell>
                        <UserAvatar user={serviceAccount} />
                    </TextCell>
                ),
                enableSorting: false,
                meta: { maxWidth: 80 },
            },
            {
                id: 'name',
                header: 'Name',
                accessorFn: (row) => row.name || '',
                cell: ({ row: { original: serviceAccount } }) => (
                    <HighlightCell
                        value={serviceAccount.name ?? ''}
                        subtitle={serviceAccount.username}
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
                cell: ({ getValue, row: { original: serviceAccount } }) => (
                    <RoleCell
                        value={String(getValue() ?? '')}
                        role={serviceAccount.rootRole}
                    />
                ),
                meta: { maxWidth: 120 },
            },
            {
                id: 'tokens',
                header: 'Tokens',
                accessorFn: (row) =>
                    row.tokens
                        ?.map(({ description }) => description)
                        .join('\n') || '',
                cell: ({ getValue, row: { original: serviceAccount } }) => (
                    <ServiceAccountTokensCell
                        serviceAccount={serviceAccount}
                        value={String(getValue() ?? '')}
                        onCreateToken={() => {
                            setSelectedServiceAccount(serviceAccount);
                            setModalOpen(true);
                        }}
                    />
                ),
                meta: { searchable: true },
            },
            {
                id: 'createdAt',
                header: 'Created',
                accessorKey: 'createdAt',
                cell: DateCell,
                meta: { width: 120, maxWidth: 120 },
            },
            {
                id: 'seenAt',
                header: 'Last seen',
                accessorFn: (row) =>
                    row.tokens.sort((a, b) => {
                        const aSeenAt = new Date(a.seenAt || 0);
                        const bSeenAt = new Date(b.seenAt || 0);
                        return bSeenAt?.getTime() - aSeenAt?.getTime();
                    })[0]?.seenAt,
                cell: TimeAgoCell,
                meta: { maxWidth: 150 },
            },
            {
                id: 'Actions',
                header: 'Actions',
                cell: ({ row: { original: serviceAccount } }) => (
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
                enableSorting: false,
                meta: { width: 150, align: 'center' },
            },
            // Always hidden -- for search
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

    const [initialState] = useState({
        sorting: [{ id: 'createdAt', desc: true }],
        columnVisibility: { username: false },
    });

    const { data, getSearchText } = useSearch(
        columns,
        searchValue,
        serviceAccounts,
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
                condition: isExtraSmallScreen,
                columns: ['role', 'seenAt'],
            },
            {
                condition: isSmallScreen,
                columns: ['imageUrl', 'tokens', 'createdAt'],
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
                    title={`Service Accounts (${rowCount})`}
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
                                variant='contained'
                                color='primary'
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
                <VirtualizedTableV8 tableInstance={table} />
            </SearchHighlightProvider>
            <ConditionallyRender
                condition={rowCount === 0}
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
