import { useMemo, VFC } from 'react';
import { IconButton, Tooltip, useMediaQuery } from '@mui/material';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { IGroupUser } from 'interfaces/group';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';
import { ActionCell } from 'component/common/Table/cells/ActionCell/ActionCell';
import { Delete } from '@mui/icons-material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { VirtualizedTable } from 'component/common/Table';
import { useFlexLayout, useSortBy, useTable } from 'react-table';
import { sortTypes } from 'utils/sortTypes';
import { UserAvatar } from 'component/common/UserAvatar/UserAvatar';
import theme from 'themes/theme';
import useHiddenColumns from 'hooks/useHiddenColumns';

const hiddenColumnsSmall = ['imageUrl', 'name'];

interface IGroupFormUsersTableProps {
    users: IGroupUser[];
    setUsers: React.Dispatch<React.SetStateAction<IGroupUser[]>>;
}

export const GroupFormUsersTable: VFC<IGroupFormUsersTableProps> = ({
    users,
    setUsers,
}) => {
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    const columns = useMemo(
        () => [
            {
                Header: 'Avatar',
                accessor: 'imageUrl',
                Cell: ({ row: { original: user } }: any) => (
                    <TextCell>
                        <UserAvatar user={user} />
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
                Header: 'Action',
                id: 'Action',
                align: 'center',
                Cell: ({ row: { original: rowUser } }: any) => (
                    <ActionCell>
                        <Tooltip
                            title="Remove user from group"
                            arrow
                            describeChild
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

    const { headerGroups, rows, prepareRow, setHiddenColumns } = useTable(
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

    useHiddenColumns(setHiddenColumns, hiddenColumnsSmall, isSmallScreen);

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
