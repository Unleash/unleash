import { useMemo, useRef } from 'react';
import { TablePlaceholder, VirtualizedTable } from 'component/common/Table';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useFlexLayout, useSortBy, useTable } from 'react-table';
import { sortTypes } from 'utils/sortTypes';
import { IconCell } from 'component/common/Table/cells/IconCell/IconCell';
import Check from '@mui/icons-material/Check';
import Close from '@mui/icons-material/Close';
import { Box } from '@mui/material';
import type { IMatrixPermission } from 'interfaces/permissions';

export const PermissionsTable = ({
    permissions,
}: {
    permissions: IMatrixPermission[];
}) => {
    const columns = useMemo(
        () => [
            {
                Header: 'Permission',
                accessor: 'name',
                minWidth: 100,
            },
            {
                Header: 'Description',
                accessor: 'displayName',
                minWidth: 180,
            },
            {
                Header: 'Has permission',
                accessor: 'hasPermission',
                Cell: ({ value }: { value: boolean }) => (
                    <IconCell
                        icon={
                            value ? (
                                <Check color='success' />
                            ) : (
                                <Close color='error' />
                            )
                        }
                    />
                ),
            },
        ],
        [permissions],
    );

    const initialState = {
        sortBy: [{ id: 'name', desc: true }],
    };

    const { headerGroups, rows, prepareRow } = useTable(
        {
            columns: columns as any,
            data: permissions ?? [],
            initialState,
            sortTypes,
        },
        useSortBy,
        useFlexLayout,
    );

    const parentRef = useRef<HTMLElement | null>(null);

    return (
        <Box sx={{ maxHeight: 500, overflow: 'auto' }} ref={parentRef}>
            <VirtualizedTable
                rows={rows}
                headerGroups={headerGroups}
                prepareRow={prepareRow}
                parentRef={parentRef}
            />
            <ConditionallyRender
                condition={rows.length === 0}
                show={
                    <TablePlaceholder>No permissions found.</TablePlaceholder>
                }
            />
        </Box>
    );
};
