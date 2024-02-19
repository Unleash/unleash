import { useMemo } from 'react';
import { IApiToken } from 'hooks/api/getters/useApiTokens/useApiTokens';
import { DateCell } from 'component/common/Table/cells/DateCell/DateCell';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';
import { IconCell } from 'component/common/Table/cells/IconCell/IconCell';
import { TimeAgoCell } from 'component/common/Table/cells/TimeAgoCell/TimeAgoCell';
import { useTable, useGlobalFilter, useSortBy } from 'react-table';
import { sortTypes } from 'utils/sortTypes';
import { ProjectsList } from 'component/admin/apiToken/ProjectsList/ProjectsList';
import { Key } from '@mui/icons-material';

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
        () => ({ sortBy: [{ id: 'instanceId' }] }),
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
                Cell: HighlightCell,
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
