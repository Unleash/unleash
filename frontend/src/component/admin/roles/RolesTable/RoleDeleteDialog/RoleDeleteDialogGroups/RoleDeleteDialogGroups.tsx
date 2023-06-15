import { VirtualizedTable } from 'component/common/Table';
import { DateCell } from 'component/common/Table/cells/DateCell/DateCell';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';
import { useMemo, useState } from 'react';
import { useTable, useSortBy, useFlexLayout, Column } from 'react-table';
import { sortTypes } from 'utils/sortTypes';
import { IGroup } from 'interfaces/group';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';

export type PageQueryType = Partial<
    Record<'sort' | 'order' | 'search', string>
>;

interface IRoleDeleteDialogGroupsProps {
    groups: IGroup[];
}

export const RoleDeleteDialogGroups = ({
    groups,
}: IRoleDeleteDialogGroupsProps) => {
    const [initialState] = useState(() => ({
        sortBy: [{ id: 'createdAt' }],
    }));

    const columns = useMemo(
        () =>
            [
                {
                    id: 'name',
                    Header: 'Name',
                    accessor: (row: any) => row.name || '',
                    minWidth: 200,
                    Cell: ({ row: { original: group } }: any) => (
                        <HighlightCell
                            value={group.name}
                            subtitle={group.description}
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
                    id: 'users',
                    Header: 'Users',
                    accessor: (row: IGroup) =>
                        row.users.length === 1
                            ? '1 user'
                            : `${row.users.length} users`,
                    Cell: TextCell,
                    maxWidth: 150,
                },
            ] as Column<IGroup>[],
        []
    );

    const { headerGroups, rows, prepareRow } = useTable(
        {
            columns,
            data: groups,
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
