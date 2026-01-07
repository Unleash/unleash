import { useMemo } from 'react';
import type { IApiToken } from 'hooks/api/getters/useApiTokens/useApiTokens';
import { DateCell } from 'component/common/Table/cells/DateCell/DateCell';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';
import { TimeAgoCell } from 'component/common/Table/cells/TimeAgoCell/TimeAgoCell';
import {
    useTable,
    useGlobalFilter,
    useSortBy,
    useFlexLayout,
} from 'react-table';
import { sortTypes } from 'utils/sortTypes';
import { ProjectsList } from 'component/admin/apiToken/ProjectsList/ProjectsList';
import { ApiTokenIcon } from 'component/admin/apiToken/ApiTokenIcon/ApiTokenIcon';

export const useApiTokenTable = (
    tokens: IApiToken[],
    getActionCell: (props: any) => JSX.Element,
) => {
    const initialState = useMemo(
        () => ({ sortBy: [{ id: 'createdAt', desc: true }] }),
        [],
    );

    const COLUMNS = useMemo(() => {
        return [
            {
                id: 'Icon',
                Cell: (props: any) => (
                    <ApiTokenIcon
                        secret={props.row.original.secret}
                        project={props.row.original.project}
                        projects={props.row.original.projects}
                    />
                ),
                disableSortBy: true,
                disableGlobalFilter: true,
                width: 50,
            },
            {
                Header: 'Token name',
                accessor: 'tokenName',
                Cell: HighlightCell,
                minWidth: 35,
            },
            {
                Header: 'Type',
                accessor: 'type',
                Cell: ({
                    value,
                }: {
                    value: 'client' | 'backend' | 'admin' | 'frontend';
                }) => (
                    <HighlightCell
                        value={tokenDescriptions[value.toLowerCase()].label}
                        subtitle={tokenDescriptions[value.toLowerCase()].title}
                        subtitleTooltip
                    />
                ),
                width: 180,
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
                width: 160,
            },
            {
                Header: 'Environment',
                accessor: 'environment',
                Cell: HighlightCell,
                width: 120,
            },
            {
                Header: 'Created',
                accessor: 'createdAt',
                Cell: DateCell,
                width: 150,
                disableGlobalFilter: true,
            },
            {
                Header: 'Last seen',
                accessor: 'seenAt',
                Cell: TimeAgoCell,
                width: 140,
                disableGlobalFilter: true,
            },
            {
                Header: 'Actions',
                width: 120,
                id: 'Actions',
                align: 'center',
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
        useSortBy,
        useFlexLayout,
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
        label: 'BACKEND',
        title: 'Connect backend SDK or Unleash Edge',
    },
    backend: {
        label: 'BACKEND',
        title: 'Connect backend SDK or Unleash Edge',
    },
    frontend: {
        label: 'FRONTEND',
        title: 'Connect frontend SDK',
    },
    admin: {
        label: 'ADMIN',
        title: 'Full access for managing Unleash',
    },
};
