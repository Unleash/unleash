import { useMemo, useState } from 'react';
import { TablePlaceholder } from 'component/common/Table';
import { VirtualizedTable } from 'component/common/Table/VirtualizedTable/VirtualizedTable';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { Box, useMediaQuery } from '@mui/material';
import { Badge } from 'component/common/Badge/Badge';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import {
    type ColumnDef,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { TimeAgoCell } from 'component/common/Table/cells/TimeAgoCell/TimeAgoCell';
import theme from 'themes/theme';
import { Search } from 'component/common/Search/Search';
import { useSearch } from 'hooks/useSearch';
import { formatDateYMDHMS } from 'utils/formatDate';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import type { IActiveSession } from 'interfaces/activeSession';
import { useActiveSessions } from 'hooks/api/getters/useActiveSessions/useActiveSessions';
import { useActiveSessionsApi } from 'hooks/api/actions/useActiveSessionsApi/useActiveSessionsApi';
import { ActiveSessionsActionsCell } from './ActiveSessionsActionsCell/ActiveSessionsActionsCell.tsx';

const defaultSort = { id: 'createdAt', desc: true };

export const ActiveSessionsTable = () => {
    const { sessions, loading, refetch } = useActiveSessions();
    const { revokeSession } = useActiveSessionsApi();
    const { setToastData, setToastApiError } = useToast();

    const [searchValue, setSearchValue] = useState('');
    const [revoking, setRevoking] = useState<IActiveSession | undefined>();

    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    const onRevokeConfirm = async () => {
        if (!revoking) {
            return;
        }
        try {
            await revokeSession(revoking.id);
            setToastData({
                type: 'success',
                text: 'Session revoked',
            });
            await refetch();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        } finally {
            setRevoking(undefined);
        }
    };

    const columns = useMemo<ColumnDef<IActiveSession, unknown>[]>(
        () => [
            {
                id: 'createdAt',
                header: 'Created',
                accessorKey: 'createdAt',
                cell: ({ getValue, column }) => (
                    <TimeAgoCell
                        value={String(getValue() ?? '')}
                        column={column}
                        dateFormat={formatDateYMDHMS}
                    />
                ),
                meta: { maxWidth: 150 },
            },
            {
                id: 'session',
                header: 'Session',
                accessorFn: (session) => session.id.slice(0, 8),
                cell: ({ getValue, row }) => {
                    const shortId = String(getValue() ?? '');
                    return (
                        <TextCell>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                }}
                            >
                                <span title='Partial session identifier'>
                                    {shortId}
                                </span>
                                {row.original.current ? (
                                    <Badge color='success'>Current</Badge>
                                ) : null}
                            </Box>
                        </TextCell>
                    );
                },
                meta: { width: 170, maxWidth: 170, searchable: true },
            },
            {
                id: 'userId',
                header: 'User ID',
                accessorFn: (session) =>
                    session.userId !== null ? String(session.userId) : '',
                cell: HighlightCell,
                meta: { width: 100, maxWidth: 100, searchable: true },
            },
            {
                id: 'username',
                header: 'User',
                accessorFn: (session) => session.username ?? '',
                cell: HighlightCell,
                meta: { minWidth: 150, searchable: true },
            },
            {
                id: 'ip',
                header: 'IP address',
                accessorFn: (session) => session.ip ?? '',
                cell: HighlightCell,
                meta: { width: 180, searchable: true },
            },
            {
                id: 'browser',
                header: 'Browser',
                accessorFn: (session) => session.browser ?? '',
                cell: HighlightCell,
                meta: { width: 120, maxWidth: 120, searchable: true },
            },
            {
                id: 'deviceType',
                header: 'Device',
                accessorFn: (session) =>
                    session.deviceType
                        ? session.deviceType.charAt(0).toUpperCase() +
                          session.deviceType.slice(1)
                        : '',
                cell: HighlightCell,
                meta: { width: 110, maxWidth: 110, searchable: true },
            },
            {
                id: 'expiredAt',
                header: 'Expires',
                accessorKey: 'expiredAt',
                cell: ({ getValue, column }) => (
                    <TimeAgoCell
                        value={String(getValue() ?? '')}
                        column={column}
                        dateFormat={formatDateYMDHMS}
                    />
                ),
                meta: { maxWidth: 150 },
            },
            {
                id: 'actions',
                header: '',
                cell: ({ row }) => (
                    <ActiveSessionsActionsCell
                        current={row.original.current}
                        onRevoke={() => setRevoking(row.original)}
                    />
                ),
                enableSorting: false,
                meta: { width: 80, align: 'center' },
            },
        ],
        [],
    );

    const { data, getSearchText, getSearchContext } = useSearch(
        columns,
        searchValue,
        sessions,
    );

    const table = useReactTable({
        columns,
        data,
        initialState: { sorting: [defaultSort] },
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
                    title={`Active sessions (${rowCount})`}
                    actions={
                        <ConditionallyRender
                            condition={!isSmallScreen}
                            show={
                                <Search
                                    initialValue={searchValue}
                                    onChange={setSearchValue}
                                    hasFilters
                                    getSearchContext={getSearchContext}
                                />
                            }
                        />
                    }
                >
                    <ConditionallyRender
                        condition={isSmallScreen}
                        show={
                            <Search
                                initialValue={searchValue}
                                onChange={setSearchValue}
                                hasFilters
                                getSearchContext={getSearchContext}
                            />
                        }
                    />
                </PageHeader>
            }
        >
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
                                No active sessions found matching &ldquo;
                                {searchValue}
                                &rdquo;
                            </TablePlaceholder>
                        }
                        elseShow={
                            <TablePlaceholder>
                                No active sessions available.
                            </TablePlaceholder>
                        }
                    />
                }
            />
            <Dialogue
                open={Boolean(revoking)}
                title='Revoke session?'
                primaryButtonText='Revoke session'
                secondaryButtonText='Cancel'
                onClick={onRevokeConfirm}
                onClose={() => setRevoking(undefined)}
            >
                <ConditionallyRender
                    condition={Boolean(revoking?.current)}
                    show={
                        <p>
                            This is <strong>your current session</strong>.
                            Revoking it will log you out immediately.
                        </p>
                    }
                    elseShow={
                        <p>
                            You are about to revoke the session for user{' '}
                            <strong>
                                {revoking?.username ?? revoking?.userId}
                            </strong>
                            . They will be logged out immediately.
                        </p>
                    }
                />
            </Dialogue>
        </PageContent>
    );
};
