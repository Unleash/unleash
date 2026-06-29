import { useMemo } from 'react';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';
import {
    type ColumnDef,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { TimeAgoCell } from 'component/common/Table/cells/TimeAgoCell/TimeAgoCell';

type ConnectedInstancesTableData = {
    instanceId: string;
    ip: string;
    sdkVersion: string;
    lastSeen: string;
};

export const useConnectedInstancesTable = (
    instanceData: ConnectedInstancesTableData[],
) => {
    const initialState = useMemo(
        () => ({ sorting: [{ id: 'lastSeen', desc: true }] }),
        [],
    );

    const columns = useMemo<ColumnDef<ConnectedInstancesTableData, unknown>[]>(
        () => [
            {
                id: 'instanceId',
                header: 'Instances',
                accessorKey: 'instanceId',
                cell: HighlightCell,
                meta: { styles: { width: '45%' } },
            },
            {
                id: 'sdkVersion',
                header: 'SDK',
                accessorKey: 'sdkVersion',
                cell: HighlightCell,
                meta: { styles: { width: '20%' } },
            },
            {
                id: 'lastSeen',
                header: 'Last seen',
                accessorKey: 'lastSeen',
                cell: TimeAgoCell,
                meta: { styles: { width: '20%' } },
            },
            {
                id: 'ip',
                header: 'IP',
                accessorKey: 'ip',
                cell: HighlightCell,
                meta: { styles: { width: '15%' } },
            },
        ],
        [],
    );

    const table = useReactTable({
        columns,
        data: instanceData,
        initialState,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        autoResetAll: false,
        enableSortingRemoval: false,
    });

    return { table, columns };
};
