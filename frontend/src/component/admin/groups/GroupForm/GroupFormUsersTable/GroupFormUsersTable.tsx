import { useMemo, VFC } from 'react';
import { Avatar, IconButton, styled, Tooltip } from '@mui/material';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { IGroupUser } from 'interfaces/group';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';
import { GroupUserRoleCell } from 'component/admin/groups/GroupUserRoleCell/GroupUserRoleCell';
import { ActionCell } from 'component/common/Table/cells/ActionCell/ActionCell';
import { Delete } from '@mui/icons-material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { VirtualizedTable } from 'component/common/Table';
import { useFlexLayout, useSortBy, useTable } from 'react-table';
import { sortTypes } from 'utils/sortTypes';

const StyledAvatar = styled(Avatar)(({ theme }) => ({
    width: theme.spacing(4),
    height: theme.spacing(4),
    margin: 'auto',
}));

interface IGroupFormUsersTableProps {
    users: IGroupUser[];
    setUsers: React.Dispatch<React.SetStateAction<IGroupUser[]>>;
}

export const GroupFormUsersTable: VFC<IGroupFormUsersTableProps> = ({
    users,
    setUsers,
}) => {
    const columns = useMemo(
        () => [
            {
                Header: 'Avatar',
                accessor: 'imageUrl',
                Cell: ({ row: { original: user } }: any) => (
                    <TextCell>
                        <StyledAvatar
                            data-loading
                            alt="Gravatar"
                            src={user.imageUrl}
                            title={`${
                                user.name || user.email || user.username
                            } (id: ${user.id})`}
                        />
                    </TextCell>
                ),
                maxWidth: 85,
                disableSortBy: true,
            },
            {
                id: 'name',
                Header: 'Name',
                accessor: (row: IGroupUser) => row.name || '',
                Cell: HighlightCell,
                minWidth: 100,
                searchable: true,
            },
            {
                id: 'username',
                Header: 'Username',
                accessor: (row: IGroupUser) => row.username || row.email,
                Cell: HighlightCell,
                minWidth: 100,
                searchable: true,
            },
            {
                Header: 'Group role',
                accessor: 'role',
                Cell: ({ row: { original: rowUser } }: any) => (
                    <GroupUserRoleCell
                        value={rowUser.role}
                        onChange={role =>
                            setUsers((users: IGroupUser[]) => {
                                const newUsers = [...users];
                                const index = newUsers.findIndex(
                                    user => user.id === rowUser.id
                                );
                                newUsers[index] = {
                                    ...rowUser,
                                    role,
                                };
                                return newUsers;
                            })
                        }
                    />
                ),
                maxWidth: 150,
                filterName: 'type',
            },
            {
                Header: 'Action',
                id: 'Action',
                align: 'center',
                Cell: ({ row: { original: rowUser } }: any) => (
                    <ActionCell>
                        <Tooltip
                            title="Remove user from group"
                            arrow
                            placement="bottom-end"
                            describeChild
                            enterDelay={1000}
                        >
                            <IconButton
                                onClick={() =>
                                    setUsers((users: IGroupUser[]) =>
                                        users.filter(
                                            user => user.id !== rowUser.id
                                        )
                                    )
                                }
                            >
                                <Delete />
                            </IconButton>
                        </Tooltip>
                    </ActionCell>
                ),
                maxWidth: 100,
                disableSortBy: true,
            },
        ],
        [setUsers]
    );

    const { headerGroups, rows, prepareRow } = useTable(
        {
            columns: columns as any[],
            data: users as any[],
            sortTypes,
            autoResetSortBy: false,
            disableSortRemove: true,
            disableMultiSort: true,
        },
        useSortBy,
        useFlexLayout
    );

    return (
        <ConditionallyRender
            condition={rows.length > 0}
            show={
                <VirtualizedTable
                    rows={rows}
                    headerGroups={headerGroups}
                    prepareRow={prepareRow}
                />
            }
        />
    );
};
