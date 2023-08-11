import { VirtualizedTable } from 'component/common/Table';
import { useMemo, useState } from 'react';
import { useTable, useSortBy, useFlexLayout, Column } from 'react-table';
import { sortTypes } from 'utils/sortTypes';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';
import { IProjectRoleUsageCount } from 'interfaces/project';

interface IRoleDeleteDialogProjectRoleTableProps {
    projects: IProjectRoleUsageCount[];
}

export const RoleDeleteDialogProjectRoleTable = ({
    projects,
}: IRoleDeleteDialogProjectRoleTableProps) => {
    const [initialState] = useState(() => ({
        sortBy: [{ id: 'name' }],
    }));

    const columns = useMemo(
        () =>
            [
                {
                    id: 'name',
                    Header: 'Project name',
                    accessor: (row: any) => row.project || '',
                    minWidth: 200,
                    Cell: ({ row: { original: item } }: any) => (
                        <HighlightCell value={item.project} />
                    ),
                },
                {
                    id: 'users',
                    Header: 'Assigned users',
                    accessor: (row: any) =>
                        row.userCount === 1
                            ? '1 user'
                            : `${row.userCount} users`,
                    Cell: TextCell,
                    maxWidth: 150,
                },
                {
                    id: 'groups',
                    Header: 'Assigned groups',
                    accessor: (row: any) =>
                        row.groupCount === 1
                            ? '1 group'
                            : `${row.groupCount} groups`,
                    Cell: TextCell,
                    maxWidth: 150,
                },
            ] as Column<IProjectRoleUsageCount>[],
        []
    );

    const { headerGroups, rows, prepareRow } = useTable(
        {
            columns,
            data: projects,
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
