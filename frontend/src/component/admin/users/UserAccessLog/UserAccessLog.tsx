import { useMemo } from 'react';
import { Box, Tooltip, styled } from '@mui/material';
import { createColumnHelper, useReactTable } from '@tanstack/react-table';
import { NumberParam, StringParam, withDefault } from 'use-query-params';
import { PaginatedTable, TablePlaceholder } from 'component/common/Table';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { RoleCell } from 'component/common/Table/cells/RoleCell/RoleCell';
import { UserAvatar } from 'component/common/UserAvatar/UserAvatar';
import { Badge } from 'component/common/Badge/Badge';
import { TimeAgo } from 'component/common/TimeAgo/TimeAgo';
import { getLocalizedDateString } from 'component/common/util';
import { usePersistentTableState } from 'hooks/usePersistentTableState';
import { useLocationSettings } from 'hooks/useLocationSettings';
import useLoading from 'hooks/useLoading';
import { withTableState } from 'utils/withTableState';
import { useUsers } from 'hooks/api/getters/useUsers/useUsers';
import type { IRole } from 'interfaces/role';
import type { UserAccessLogEntrySchema } from 'openapi';
import {
    DEFAULT_PAGE_LIMIT,
    useUserAccessLog,
} from 'hooks/api/getters/useUserAccessLog/useUserAccessLog';

const columnHelper = createColumnHelper<UserAccessLogEntrySchema>();

const StyledUserCell = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const StyledUserInfo = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
});

const StyledSubtitle = styled('span')(({ theme }) => ({
    color: theme.palette.text.secondary,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
}));

const UpdatedCell = ({ entry }: { entry: UserAccessLogEntrySchema }) => {
    const { locationSettings } = useLocationSettings();
    const activity =
        entry.status === 'removed' ? entry.removedAt : entry.createdAt;
    const added = entry.createdAt
        ? getLocalizedDateString(entry.createdAt, locationSettings.locale)
        : '—';
    const removed = entry.removedAt
        ? getLocalizedDateString(entry.removedAt, locationSettings.locale)
        : null;

    return (
        <TextCell lineClamp={1}>
            <Tooltip
                arrow
                title={
                    <>
                        <div>Added: {added}</div>
                        {removed ? <div>Removed: {removed}</div> : null}
                    </>
                }
            >
                <span>{activity ? <TimeAgo date={activity} /> : '—'}</span>
            </Tooltip>
        </TextCell>
    );
};

export const UserAccessLog = () => {
    const { roles } = useUsers();

    const stateConfig = {
        offset: withDefault(NumberParam, 0),
        limit: withDefault(NumberParam, DEFAULT_PAGE_LIMIT),
        sortBy: withDefault(StringParam, 'updated'),
        sortOrder: withDefault(StringParam, 'desc'),
    };
    const [tableState, setTableState] = usePersistentTableState(
        'user-access-log-table',
        stateConfig,
    );

    const { items, total, loading } = useUserAccessLog({
        offset: tableState.offset ? `${tableState.offset}` : undefined,
        limit: `${tableState.limit}`,
        sortOrder: tableState.sortOrder === 'asc' ? 'asc' : 'desc',
    });

    const isPlaceholder = loading;

    const placeholderData = useMemo<UserAccessLogEntrySchema[]>(
        () =>
            Array(tableState.limit)
                .fill(null)
                .map((_, index) => ({
                    user: {
                        id: index,
                        name: 'Loading user',
                        email: 'loading@example.com',
                        imageUrl: '',
                    },
                    status: 'added',
                    createdAt: new Date(2024, 0, 1).toISOString(),
                    performedBy: { id: 0, name: 'Loading user', imageUrl: '' },
                })),
        [tableState.limit],
    );

    const bodyLoadingRef = useLoading(isPlaceholder);

    const data = useMemo(
        () => (isPlaceholder ? placeholderData : items),
        [isPlaceholder, placeholderData, items],
    );

    const columns = useMemo(
        () => [
            columnHelper.accessor((row) => row.user.name || '', {
                id: 'user',
                header: 'User',
                cell: ({ row }) => {
                    const user = row.original.user;
                    const subtitle = user.email || user.username;
                    return (
                        <TextCell>
                            <StyledUserCell>
                                <UserAvatar user={user} />
                                <StyledUserInfo>
                                    <span>{user.name || ''}</span>
                                    {subtitle ? (
                                        <StyledSubtitle>
                                            {subtitle}
                                        </StyledSubtitle>
                                    ) : null}
                                </StyledUserInfo>
                            </StyledUserCell>
                        </TextCell>
                    );
                },
                enableSorting: false,
                meta: { minWidth: 220 },
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
            columnHelper.accessor(
                (row) =>
                    row.status === 'removed' ? row.removedAt : row.createdAt,
                {
                    id: 'updated',
                    header: 'Updated',
                    cell: ({ row }) => <UpdatedCell entry={row.original} />,
                    enableSorting: true,
                    meta: { width: 160, maxWidth: 160 },
                },
            ),
            columnHelper.accessor((row) => row.performedBy?.name || '', {
                id: 'performedBy',
                header: 'Performed by',
                cell: ({ row }) => {
                    const performer = row.original.performedBy;
                    if (!performer?.id) {
                        return <TextCell>System</TextCell>;
                    }
                    return (
                        <TextCell>
                            <StyledUserCell>
                                <UserAvatar user={performer} />
                                <span>{performer.name || performer.id}</span>
                            </StyledUserCell>
                        </TextCell>
                    );
                },
                enableSorting: false,
                meta: { minWidth: 180 },
            }),
        ],
        [roles],
    );

    const table = useReactTable(
        withTableState(tableState, setTableState, {
            columns,
            data,
        }),
    );

    const rows = table.getRowModel().rows;

    return (
        <>
            <div ref={bodyLoadingRef}>
                <PaginatedTable tableInstance={table} totalItems={total} />
            </div>
            {rows.length === 0 && !isPlaceholder ? (
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
