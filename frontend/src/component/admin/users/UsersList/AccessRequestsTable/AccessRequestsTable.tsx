import { useMemo, useState } from 'react';
import { useFlexLayout, useSortBy, useTable } from 'react-table';
import { Button, IconButton, Typography, styled } from '@mui/material';
import Delete from '@mui/icons-material/Delete';
import { VirtualizedTable } from 'component/common/Table';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { DateCell } from 'component/common/Table/cells/DateCell/DateCell';
import { UserAvatar } from 'component/common/UserAvatar/UserAvatar';
import { sortTypes } from 'utils/sortTypes';
import { useUsers } from 'hooks/api/getters/useUsers/useUsers';
import { useUserAccessRequests } from 'hooks/api/getters/useUserAccessRequests/useUserAccessRequests';
import { useUserAccessRequestsApi } from 'hooks/api/actions/useUserAccessRequestsApi/useUserAccessRequestsApi';
import type { UserAccessRequestSchema } from 'openapi';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { RoleSelectCell } from './RoleSelectCell.tsx';

const StyledTitle = styled(Typography)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    fontWeight: theme.typography.fontWeightBold,
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
    const { roles } = useUsers();
    const { accessRequests, refetchAccessRequests } = useUserAccessRequests();
    const { approveAccessRequest } = useUserAccessRequestsApi();
    const { setToastData, setToastApiError } = useToast();

    const viewerRole = roles.find((r) => r.name.toLowerCase() === 'viewer');
    const defaultRoleId = viewerRole?.id ?? roles[0]?.id ?? 0;

    const [selectedRoles, setSelectedRoles] = useState<Record<string, number>>(
        {},
    );

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
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const handleDelete = (_request: UserAccessRequestSchema) => {
        // TODO: implement reject
    };

    const columns = useMemo(
        () => [
            {
                Header: 'Avatar',
                id: 'avatar',
                accessor: 'email',
                Cell: ({ row: { original } }: any) => (
                    <TextCell>
                        <UserAvatar user={original} />
                    </TextCell>
                ),
                disableSortBy: true,
                maxWidth: 80,
            },
            {
                id: 'email',
                Header: 'Email',
                accessor: (row: any) => row.email || '',
                minWidth: 180,
                Cell: ({
                    row: { original },
                }: {
                    row: { original: UserAccessRequestSchema };
                }) => <TextCell>{original.email}</TextCell>,
            },
            {
                id: 'role',
                Header: 'Role',
                accessor: () => '',
                Cell: ({
                    row: { original },
                }: {
                    row: { original: UserAccessRequestSchema };
                }) => (
                    <RoleSelectCell
                        roles={roles}
                        selectedRoleId={getRoleId(original.id)}
                        onChange={(roleId) =>
                            handleRoleChange(original.id, roleId)
                        }
                    />
                ),
                maxWidth: 120,
                disableSortBy: true,
            },
            {
                Header: 'Requested',
                accessor: 'requestedAt',
                Cell: DateCell,
                width: 200,
                maxWidth: 200,
            },
            {
                Header: 'Actions',
                id: 'actions',
                align: 'center',
                Cell: ({
                    row: { original },
                }: {
                    row: { original: UserAccessRequestSchema };
                }) => (
                    <StyledActions>
                        <Button
                            variant='outlined'
                            color='primary'
                            size='small'
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
                width: 250,
                maxWidth: 250,
                disableSortBy: true,
            },
        ],
        [roles, selectedRoles, defaultRoleId],
    );

    const initialState = useMemo(
        () => ({
            sortBy: [{ id: 'requestedAt', desc: true }],
        }),
        [],
    );

    const { headerGroups, rows, prepareRow } = useTable(
        {
            columns: columns as any,
            data: accessRequests,
            initialState,
            sortTypes,
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

    if (accessRequests.length === 0) {
        return null;
    }

    return (
        <StyledContainer>
            <StyledTitle>Access requests ({accessRequests.length})</StyledTitle>
            <VirtualizedTable
                rows={rows}
                headerGroups={headerGroups}
                prepareRow={prepareRow}
            />
        </StyledContainer>
    );
};
