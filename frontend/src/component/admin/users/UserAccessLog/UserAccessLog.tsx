import { useMemo } from 'react';
import { Box } from '@mui/material';
import { createColumnHelper, useReactTable } from '@tanstack/react-table';
import {
    encodeQueryParams,
    NumberParam,
    StringParam,
    withDefault,
} from 'use-query-params';
import mapValues from 'lodash.mapvalues';
import { PaginatedTable, TablePlaceholder } from 'component/common/Table';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';
import { DateCell } from 'component/common/Table/cells/DateCell/DateCell';
import { RoleCell } from 'component/common/Table/cells/RoleCell/RoleCell';
import { UserAvatar } from 'component/common/UserAvatar/UserAvatar';
import { Badge } from 'component/common/Badge/Badge';
import { usePersistentTableState } from 'hooks/usePersistentTableState';
import useLoading from 'hooks/useLoading';
import { withTableState } from 'utils/withTableState';
import { useUsers } from 'hooks/api/getters/useUsers/useUsers';
import type { IRole } from 'interfaces/role';
import {
    DEFAULT_PAGE_LIMIT,
    useUserAccessLog,
    type IUserAccessLogEntry,
} from 'hooks/api/getters/useUserAccessLog/useUserAccessLog';

const columnHelper = createColumnHelper<IUserAccessLogEntry>();

export const UserAccessLog = () => {
    const { roles } = useUsers();

    const stateConfig = {
        offset: withDefault(NumberParam, 0),
        limit: withDefault(NumberParam, DEFAULT_PAGE_LIMIT),
        sortOrder: withDefault(StringParam, 'desc'),
    };
    const [tableState, setTableState] = usePersistentTableState(
        'user-access-log-table',
        stateConfig,
    );

    const { items, total, loading } = useUserAccessLog(
        mapValues(encodeQueryParams(stateConfig, tableState), (value) =>
            value ? `${value}` : undefined,
        ),
    );

    const bodyLoadingRef = useLoading(loading);

    const columns = useMemo(
        () => [
            columnHelper.accessor('user', {
                id: 'avatar',
                header: 'Avatar',
                cell: ({ row }) => (
                    <TextCell>
                        <UserAvatar user={row.original.user} />
                    </TextCell>
                ),
                enableSorting: false,
                meta: { maxWidth: 80 },
            }),
            columnHelper.accessor((row) => row.user.name || '', {
                id: 'name',
                header: 'Name',
                cell: ({ row }) => (
                    <HighlightCell
                        value={row.original.user.name ?? ''}
                        subtitle={
                            row.original.user.email ||
                            row.original.user.username
                        }
                    />
                ),
                enableSorting: false,
                meta: { minWidth: 180 },
            }),
            columnHelper.accessor(
                (row) =>
                    roles.find((role: IRole) => role.id === row.user.rootRole)
                        ?.name || '',
                {
                    id: 'role',
                    header: 'Role',
                    cell: ({ getValue, row }) => (
                        <RoleCell
                            value={String(getValue() ?? '')}
                            role={row.original.user.rootRole ?? 0}
                        />
                    ),
                    enableSorting: false,
                    meta: { maxWidth: 120 },
                },
            ),
            columnHelper.accessor('status', {
                id: 'status',
                header: 'Status',
                cell: ({ row }) =>
                    row.original.status === 'removed' ? (
                        <TextCell>
                            <Badge color='error'>Removed</Badge>
                        </TextCell>
                    ) : (
                        <TextCell>
                            <Badge color='success'>Added</Badge>
                        </TextCell>
                    ),
                enableSorting: false,
                meta: { maxWidth: 120 },
            }),
            columnHelper.accessor((row) => row.createdAt, {
                id: 'createdAt',
                header: 'Added',
                cell: DateCell,
                enableSorting: false,
                meta: { width: 130, maxWidth: 130 },
            }),
            columnHelper.accessor((row) => row.removedAt, {
                id: 'removedAt',
                header: 'Removed',
                cell: DateCell,
                enableSorting: false,
                meta: { width: 130, maxWidth: 130 },
            }),
            columnHelper.accessor((row) => row.performedBy?.name || '', {
                id: 'performedBy',
                header: 'Performed by',
                cell: ({ row }) => {
                    const performer = row.original.performedBy;
                    if (!performer?.id) {
                        return <TextCell>System</TextCell>;
                    }
                    return (
                        <TextCell>{performer.name || performer.id}</TextCell>
                    );
                },
                enableSorting: false,
                meta: { minWidth: 150 },
            }),
        ],
        [roles],
    );

    const table = useReactTable(
        withTableState(tableState, setTableState, {
            columns,
            data: items,
        }),
    );

    const rows = table.getRowModel().rows;

    return (
        <>
            <div ref={bodyLoadingRef}>
                <PaginatedTable tableInstance={table} totalItems={total} />
            </div>
            {rows.length === 0 && !loading ? (
                <Box sx={(theme) => ({ padding: theme.spacing(0, 2, 2) })}>
                    <TablePlaceholder>
                        No user access log entries found.
                    </TablePlaceholder>
                </Box>
            ) : null}
        </>
    );
};

export default UserAccessLog;
