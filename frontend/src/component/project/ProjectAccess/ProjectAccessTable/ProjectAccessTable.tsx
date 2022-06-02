import { useMemo, VFC } from 'react';
import { useSortBy, useTable } from 'react-table';
import {
    Table,
    TableBody,
    TableRow,
    TableCell,
    SortableTableHeader,
} from 'component/common/Table';
import { Avatar, Box, SelectChangeEvent } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { sortTypes } from 'utils/sortTypes';
import {
    IProjectAccessOutput,
    IProjectAccessUser,
} from 'hooks/api/getters/useProjectAccess/useProjectAccess';
import { ProjectRoleCell } from './ProjectRoleCell/ProjectRoleCell';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { UPDATE_PROJECT } from 'component/providers/AccessProvider/permissions';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';

const initialState = {
    sortBy: [{ id: 'name' }],
};

interface IProjectAccessTableProps {
    access: IProjectAccessOutput;
    projectId: string;
    handleRoleChange: (
        userId: number
    ) => (event: SelectChangeEvent) => Promise<void>;
    handleRemoveAccess: (user: IProjectAccessUser) => void;
}

export const ProjectAccessTable: VFC<IProjectAccessTableProps> = ({
    access,
    projectId,
    handleRoleChange,
    handleRemoveAccess,
}) => {
    const data = access.users;

    const columns = useMemo(
        () => [
            {
                Header: 'Avatar',
                accessor: 'imageUrl',
                disableSortBy: true,
                width: 80,
                Cell: ({ value }: { value: string }) => (
                    <Avatar
                        alt="Gravatar"
                        src={value}
                        sx={{ width: 32, height: 32, mx: 'auto' }}
                    />
                ),
                align: 'center',
            },
            {
                id: 'name',
                Header: 'Name',
                accessor: (row: any) => row.name || '',
            },
            {
                id: 'username',
                Header: 'Username',
                accessor: 'email',
                Cell: ({ row: { original: user } }: any) => (
                    <TextCell>{user.email || user.username}</TextCell>
                ),
            },
            {
                Header: 'Role',
                accessor: 'roleId',
                Cell: ({
                    value,
                    row: { original: user },
                }: {
                    value: number;
                    row: { original: IProjectAccessUser };
                }) => (
                    <ProjectRoleCell
                        value={value}
                        user={user}
                        roles={access.roles}
                        onChange={handleRoleChange(user.id)}
                    />
                ),
            },
            {
                id: 'actions',
                Header: 'Actions',
                disableSortBy: true,
                align: 'center',
                width: 80,
                Cell: ({ row: { original: user } }: any) => (
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                        }}
                    >
                        <PermissionIconButton
                            permission={UPDATE_PROJECT}
                            projectId={projectId}
                            edge="end"
                            onClick={() => handleRemoveAccess(user)}
                            disabled={access.users.length === 1}
                            tooltipProps={{
                                title:
                                    access.users.length === 1
                                        ? 'Cannot remove access. A project must have at least one owner'
                                        : 'Remove access',
                            }}
                        >
                            <Delete />
                        </PermissionIconButton>
                    </Box>
                ),
            },
        ],
        [
            access.roles,
            access.users.length,
            handleRemoveAccess,
            handleRoleChange,
            projectId,
        ]
    );

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
        useTable(
            {
                columns: columns as any[], // TODO: fix after `react-table` v8 update
                data,
                initialState,
                sortTypes,
                autoResetGlobalFilter: false,
                autoResetSortBy: false,
                disableSortRemove: true,
                defaultColumn: {
                    Cell: TextCell,
                },
            },
            useSortBy
        );

    return (
        <Table {...getTableProps()} rowHeight="compact">
            {/* @ts-expect-error -- react-table  */}
            <SortableTableHeader headerGroups={headerGroups} />
            <TableBody {...getTableBodyProps()}>
                {rows.map(row => {
                    prepareRow(row);
                    return (
                        <TableRow hover {...row.getRowProps()}>
                            {row.cells.map(cell => (
                                <TableCell {...cell.getCellProps()}>
                                    {cell.render('Cell')}
                                </TableCell>
                            ))}
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
};
