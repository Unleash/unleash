import { useMemo, useState } from 'react';
import { useFlexLayout, useSortBy, useTable } from 'react-table';
import {
    Button,
    IconButton,
    Select,
    MenuItem,
    Typography,
    styled,
} from '@mui/material';
import Delete from '@mui/icons-material/Delete';
import { VirtualizedTable } from 'component/common/Table';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { DateCell } from 'component/common/Table/cells/DateCell/DateCell';
import { UserAvatar } from 'component/common/UserAvatar/UserAvatar';
import { sortTypes } from 'utils/sortTypes';
import { useUsers } from 'hooks/api/getters/useUsers/useUsers';
import type { IRole } from 'interfaces/role';

export interface IAccessRequest {
    id: string;
    email: string;
    requestedAt: string;
}

const MOCK_ACCESS_REQUESTS: IAccessRequest[] = [
    {
        id: '1',
        email: 'henning@sillerud.com',
        requestedAt: '2026-03-24T00:00:00Z',
    },
    {
        id: '2',
        email: 'ivar+local@getunleash.io',
        requestedAt: '2026-03-10T00:00:00Z',
    },
    {
        id: '3',
        email: 'alexandru.gheorghies@intelligentbee.com',
        requestedAt: '2026-02-23T00:00:00Z',
    },
    {
        id: '4',
        email: 'cristian.busuioc@intelligentbee.com',
        requestedAt: '2026-02-23T00:00:00Z',
    },
    {
        id: '5',
        email: 'robert.cristea@intelligentbee.com',
        requestedAt: '2026-02-23T00:00:00Z',
    },
];

const StyledTitle = styled(Typography)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    fontWeight: theme.typography.fontWeightBold,
}));

const StyledSelect = styled(Select<number>)(({ theme }) => ({
    minWidth: 100,
    height: 32,
    fontSize: theme.fontSizes.smallBody,
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

const RoleSelectCell = ({
    roles,
    selectedRoleId,
    onChange,
}: {
    roles: IRole[];
    selectedRoleId: number;
    onChange: (roleId: number) => void;
}) => (
    <TextCell>
        <StyledSelect
            size='small'
            value={selectedRoleId}
            onChange={(e) => onChange(e.target.value as number)}
            variant='outlined'
        >
            {roles.map((role) => (
                <MenuItem key={role.id} value={role.id}>
                    {role.name}
                </MenuItem>
            ))}
        </StyledSelect>
    </TextCell>
);

export const AccessRequestsTable = () => {
    const { roles } = useUsers();
    const accessRequests = MOCK_ACCESS_REQUESTS;

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

    const handleApprove = (_request: IAccessRequest) => {
        // noop for now
    };

    const handleDelete = (_request: IAccessRequest) => {
        // noop for now
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
                    row: { original: IAccessRequest };
                }) => <TextCell>{original.email}</TextCell>,
            },
            {
                id: 'role',
                Header: 'Role',
                accessor: () => '',
                Cell: ({
                    row: { original },
                }: {
                    row: { original: IAccessRequest };
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
                    row: { original: IAccessRequest };
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
