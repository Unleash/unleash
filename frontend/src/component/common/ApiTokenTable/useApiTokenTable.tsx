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

export const useApiTokenTable = (
    tokens: IApiToken[],
    getActionCell: (props: any) => JSX.Element
) => {
    const initialState = useMemo(() => ({ sortBy: [{ id: 'createdAt' }] }), []);

    const COLUMNS = useMemo(() => {
        return [
            {
                id: 'Icon',
                width: '1%',
                Cell: () => <IconCell icon={<Key color="disabled" />} />,
                disableSortBy: true,
                disableGlobalFilter: true,
            },
            {
                Header: 'Username',
                accessor: 'username',
                Cell: HighlightCell,
            },
            {
                Header: 'Type',
                accessor: 'type',
                Cell: ({
                    value,
                }: {
                    value: 'client' | 'admin' | 'frontend';
                }) => (
                    <HighlightCell
                        value={tokenDescriptions[value.toLowerCase()].label}
                        subtitle={tokenDescriptions[value.toLowerCase()].title}
                    />
                ),
                minWidth: 280,
            },
            {
                Header: 'Project',
                accessor: 'project',
                Cell: (props: any) => (
                    <ProjectsList
                        project={props.row.original.project}
                        projects={props.row.original.projects}
                    />
                ),
                minWidth: 120,
            },
            {
                Header: 'Environment',
                accessor: 'environment',
                Cell: HighlightCell,
                minWidth: 120,
            },
            {
                Header: 'Created',
                accessor: 'createdAt',
                Cell: DateCell,
                minWidth: 150,
                disableGlobalFilter: true,
            },
            {
                Header: 'Last seen',
                accessor: 'seenAt',
                Cell: TimeAgoCell,
                minWidth: 150,
                disableGlobalFilter: true,
            },
            {
                Header: 'Actions',
                id: 'Actions',
                align: 'center',
                width: '1%',
                disableSortBy: true,
                disableGlobalFilter: true,
                Cell: getActionCell,
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
            data: tokens as any,
            initialState,
            sortTypes,
            autoResetHiddenColumns: false,
            disableSortRemove: true,
        },
        useGlobalFilter,
        useSortBy
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

const tokenDescriptions: {
    [index: string]: { label: string; title: string };
} = {
    client: {
        label: 'CLIENT',
        title: 'Connect server-side SDK or Unleash Proxy',
    },
    frontend: {
        label: 'FRONTEND',
        title: 'Connect web and mobile SDK',
    },
    admin: {
        label: 'ADMIN',
        title: 'Full access for managing Unleash',
    },
};
