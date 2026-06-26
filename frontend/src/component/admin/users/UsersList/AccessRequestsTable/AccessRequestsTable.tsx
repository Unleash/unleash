import { useMemo, useState } from 'react';
import {
    type ColumnDef,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { Button, IconButton, Typography, styled } from '@mui/material';
import Delete from '@mui/icons-material/Delete';
import { VirtualizedTable } from 'component/common/Table/VirtualizedTable/VirtualizedTable';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { DateCell } from 'component/common/Table/cells/DateCell/DateCell';
import { UserAvatar } from 'component/common/UserAvatar/UserAvatar';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { useUsers } from 'hooks/api/getters/useUsers/useUsers';
import { useUserAccessRequests } from 'hooks/api/getters/useUserAccessRequests/useUserAccessRequests';
import { useUserAccessRequestsApi } from 'hooks/api/actions/useUserAccessRequestsApi/useUserAccessRequestsApi';
import type { UserAccessRequestSchema } from 'openapi';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { RoleSelectCell } from './RoleSelectCell.tsx';
import { PendingAccessRequestsIndicator } from '../../AccessRequestsNotifications/PendingAccessRequestsIndicator.tsx';

const StyledTitle = styled(Typography)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    fontWeight: theme.typography.fontWeightBold,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
}));

const StyledActions = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(1, 2),
}));

const StyledContainer = styled('div')(({ theme }) => ({
    marginBottom: theme.spacing(4),
}));

export const AccessRequestsTable = () => {
    const { roles, refetch: refetchUsers } = useUsers();
    const { accessRequests, refetchAccessRequests } = useUserAccessRequests();
    const { approveAccessRequest, rejectAccessRequest } =
        useUserAccessRequestsApi();
    const { setToastData, setToastApiError } = useToast();

    const viewerRole = roles.find((r) => r.name.toLowerCase() === 'viewer');
    const defaultRoleId = viewerRole?.id ?? roles[0]?.id ?? 0;

    const [selectedRoles, setSelectedRoles] = useState<Record<string, number>>(
        {},
    );
    const [requestToReject, setRequestToReject] =
        useState<UserAccessRequestSchema | null>(null);

    const getRoleId = (requestId: string) =>
        selectedRoles[requestId] ?? defaultRoleId;

    const handleRoleChange = (requestId: string, roleId: number) => {
        setSelectedRoles((prev) => ({ ...prev, [requestId]: roleId }));
    };

    const handleApprove = async (request: UserAccessRequestSchema) => {
        try {
            await approveAccessRequest(request.id, getRoleId(request.id));
            setToastData({
                text: `Access request for ${request.email} approved`,
                type: 'success',
            });
            refetchAccessRequests();
            refetchUsers();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const handleDelete = (request: UserAccessRequestSchema) => {
        setRequestToReject(request);
    };

    const handleConfirmReject = async () => {
        if (!requestToReject) {
            return;
        }
        try {
            await rejectAccessRequest(requestToReject.id);
            setToastData({
                text: `Access request for ${requestToReject.email} rejected`,
                type: 'success',
            });
            refetchAccessRequests();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        } finally {
            setRequestToReject(null);
        }
    };

    const columns = useMemo<ColumnDef<UserAccessRequestSchema, unknown>[]>(
        () => [
            {
                id: 'avatar',
                header: 'Avatar',
                accessorKey: 'email',
                cell: ({ row: { original } }) => (
                    <TextCell>
                        <UserAvatar
                            user={{
                                ...original,
                                id: Number(original.id),
                            }}
                        />
                    </TextCell>
                ),
                enableSorting: false,
                meta: { maxWidth: 80 },
            },
            {
                id: 'email',
                header: 'Email',
                accessorFn: (row) => row.email || '',
                cell: ({ row: { original } }) => (
                    <TextCell>{original.email}</TextCell>
                ),
                meta: { minWidth: 180 },
            },
            {
                id: 'role',
                header: 'Role',
                accessorFn: () => '',
                cell: ({ row: { original } }) => (
                    <RoleSelectCell
                        roles={roles}
                        selectedRoleId={getRoleId(original.id)}
                        onChange={(roleId) =>
                            handleRoleChange(original.id, roleId)
                        }
                    />
                ),
                enableSorting: false,
                meta: { maxWidth: 120 },
            },
            {
                id: 'requestedAt',
                header: 'Requested',
                accessorKey: 'requestedAt',
                cell: DateCell,
                meta: { width: 200, maxWidth: 200 },
            },
            {
                id: 'actions',
                header: 'Actions',
                cell: ({ row: { original } }) => (
                    <StyledActions>
                        <Button
                            variant='outlined'
                            color='primary'
                            size='medium'
                            onClick={() => handleApprove(original)}
                        >
                            Approve
                        </Button>
                        <IconButton
                            size='small'
                            onClick={() => handleDelete(original)}
                        >
                            <Delete />
                        </IconButton>
                    </StyledActions>
                ),
                enableSorting: false,
                meta: { width: 250, maxWidth: 250, align: 'center' },
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [roles, selectedRoles, defaultRoleId],
    );

    const initialState = useMemo(
        () => ({
            sorting: [{ id: 'requestedAt', desc: true }],
        }),
        [],
    );

    const table = useReactTable({
        columns,
        data: accessRequests,
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

    if (accessRequests.length === 0) {
        return null;
    }

    return (
        <StyledContainer>
            <StyledTitle>
                Access requests ({accessRequests.length})
                <PendingAccessRequestsIndicator />
            </StyledTitle>
            <VirtualizedTable tableInstance={table} />
            <Dialogue
                open={Boolean(requestToReject)}
                title='Reject access request?'
                onClose={() => setRequestToReject(null)}
                onClick={handleConfirmReject}
                primaryButtonText='Reject request'
                secondaryButtonText='Cancel'
            >
                <Typography>
                    Are you sure you want to reject the access request
                    {requestToReject ? ` for ${requestToReject.email}` : ''}?
                </Typography>
            </Dialogue>
        </StyledContainer>
    );
};
