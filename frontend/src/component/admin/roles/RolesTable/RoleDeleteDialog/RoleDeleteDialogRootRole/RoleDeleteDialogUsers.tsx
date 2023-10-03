import { VirtualizedTable } from 'component/common/Table';
import { DateCell } from 'component/common/Table/cells/DateCell/DateCell';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';
import { useMemo, useState } from 'react';
import { useTable, useSortBy, useFlexLayout, Column } from 'react-table';
import { sortTypes } from 'utils/sortTypes';
import { TimeAgoCell } from 'component/common/Table/cells/TimeAgoCell/TimeAgoCell';
import { IUser } from 'interfaces/user';

export type PageQueryType = Partial<
    Record<'sort' | 'order' | 'search', string>
>;

interface IRoleDeleteDialogUsersProps {
    users: IUser[];
}

export const RoleDeleteDialogUsers = ({
    users,
}: IRoleDeleteDialogUsersProps) => {
    const [initialState] = useState(() => ({
        sortBy: [{ id: 'last-login' }],
    }));

    const columns = useMemo(
        () =>
            [
                {
                    id: 'name',
                    Header: 'Name',
                    accessor: (row: any) => row.name || '',
                    minWidth: 200,
                    Cell: ({ row: { original: user } }: any) => (
                        <HighlightCell
                            value={user.name}
                            subtitle={user.email || user.username}
                        />
                    ),
                },
                {
                    Header: 'Created',
                    accessor: 'createdAt',
                    Cell: DateCell,
                    sortType: 'date',
                    width: 120,
                    maxWidth: 120,
                },
                {
                    id: 'last-login',
                    Header: 'Last login',
                    accessor: (row: any) => row.seenAt || '',
                    Cell: ({ row: { original: user } }: any) => (
                        <TimeAgoCell
                            value={user.seenAt}
                            emptyText="Never"
                            title={date => `Last login: ${date}`}
                        />
                    ),
                    sortType: 'date',
                    maxWidth: 150,
                },
            ] as Column<IUser>[],
        []
    );

    const { headerGroups, rows, prepareRow } = useTable(
        {
            columns,
            data: users,
            initialState,
            sortTypes,
            autoResetHiddenColumns: false,
            autoResetSortBy: false,
            disableSortRemove: true,
            disableMultiSort: true,
        },
        useSortBy,
        useFlexLayout
    );

    return (
        <VirtualizedTable
            rows={rows}
            headerGroups={headerGroups}
            prepareRow={prepareRow}
        />
    );
};
