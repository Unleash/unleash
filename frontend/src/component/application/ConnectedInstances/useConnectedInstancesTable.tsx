import { useMemo } from 'react';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';
import { useTable, useGlobalFilter, useSortBy } from 'react-table';
import { sortTypes } from 'utils/sortTypes';
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
        () => ({ sortBy: [{ id: 'lastSeen', desc: true }] }),
        [],
    );

    const COLUMNS = useMemo(() => {
        return [
            {
                Header: 'Instances',
                accessor: 'instanceId',
                Cell: HighlightCell,
                styles: {
                    width: '45%',
                },
            },
            {
                Header: 'SDK',
                accessor: 'sdkVersion',
                Cell: HighlightCell,
                styles: {
                    width: '20%',
                },
            },
            {
                Header: 'Last seen',
                accessor: 'lastSeen',
                Cell: TimeAgoCell,
                styles: {
                    width: '20%',
                },
            },
            {
                Header: 'IP',
                accessor: 'ip',
                Cell: HighlightCell,
                styles: {
                    width: '15%',
                },
            },
        ];
    }, []);

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        state,
        setGlobalFilter,
        setHiddenColumns,
    } = useTable(
        {
            columns: COLUMNS as any,
            data: instanceData as any,
            initialState,
            sortTypes,
            autoResetHiddenColumns: false,
            disableSortRemove: true,
        },
        useGlobalFilter,
        useSortBy,
    );

    return {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        state,
        setGlobalFilter,
        setHiddenColumns,
        columns: COLUMNS,
    };
};
