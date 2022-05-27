import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { useEnvironments } from 'hooks/api/getters/useEnvironments/useEnvironments';
import { CreateEnvironmentButton } from 'component/environments/CreateEnvironmentButton/CreateEnvironmentButton';
import { useTable, useGlobalFilter } from 'react-table';
import {
    TableSearch,
    SortableTableHeader,
    Table,
} from 'component/common/Table';
import { useCallback } from 'react';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { TableBody } from '@mui/material';
import { CloudCircle } from '@mui/icons-material';
import { IconCell } from 'component/common/Table/cells/IconCell/IconCell';
import { EnvironmentActionCell } from 'component/environments/EnvironmentActionCell/EnvironmentActionCell';
import { EnvironmentNameCell } from 'component/environments/EnvironmentNameCell/EnvironmentNameCell';
import { EnvironmentRow } from 'component/environments/EnvironmentRow/EnvironmentRow';
import { MoveListItem } from 'hooks/useDragItem';
import useToast from 'hooks/useToast';
import useEnvironmentApi, {
    createSortOrderPayload,
} from 'hooks/api/actions/useEnvironmentApi/useEnvironmentApi';
import { formatUnknownError } from 'utils/formatUnknownError';

export const EnvironmentTable = () => {
    const { changeSortOrder } = useEnvironmentApi();
    const { setToastApiError } = useToast();
    const { environments, mutateEnvironments } = useEnvironments();

    const moveListItem: MoveListItem = useCallback(
        async (dragIndex: number, dropIndex: number, save = false) => {
            const copy = [...environments];
            const tmp = copy[dragIndex];
            copy.splice(dragIndex, 1);
            copy.splice(dropIndex, 0, tmp);
            await mutateEnvironments(copy);

            if (save) {
                try {
                    await changeSortOrder(createSortOrderPayload(copy));
                } catch (error: unknown) {
                    setToastApiError(formatUnknownError(error));
                }
            }
        },
        [changeSortOrder, environments, mutateEnvironments, setToastApiError]
    );

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        state: { globalFilter },
        setGlobalFilter,
    } = useTable(
        {
            columns: COLUMNS as any,
            data: environments,
            autoResetGlobalFilter: false,
        },
        useGlobalFilter
    );

    const headerSearch = (
        <TableSearch initialValue={globalFilter} onChange={setGlobalFilter} />
    );

    const headerActions = (
        <>
            {headerSearch}
            <PageHeader.Divider />
            <CreateEnvironmentButton />
        </>
    );

    const header = <PageHeader title="Environments" actions={headerActions} />;

    return (
        <PageContent header={header}>
            <SearchHighlightProvider value={globalFilter}>
                <Table {...getTableProps()}>
                    <SortableTableHeader headerGroups={headerGroups as any} />
                    <TableBody {...getTableBodyProps()}>
                        {rows.map(row => {
                            prepareRow(row);
                            return (
                                <EnvironmentRow
                                    row={row as any}
                                    moveListItem={moveListItem}
                                    key={row.original.name}
                                />
                            );
                        })}
                    </TableBody>
                </Table>
            </SearchHighlightProvider>
        </PageContent>
    );
};

const COLUMNS = [
    {
        id: 'Icon',
        canSort: false,
        Cell: () => <IconCell icon={<CloudCircle color="disabled" />} />,
    },
    {
        Header: 'Name',
        accessor: 'name',
        width: '100%',
        canSort: false,
        Cell: ({ row: { original } }: any) => (
            <EnvironmentNameCell environment={original} />
        ),
    },
    {
        Header: 'Actions',
        id: 'Actions',
        align: 'center',
        canSort: false,
        Cell: ({ row: { original } }: any) => (
            <EnvironmentActionCell environment={original} />
        ),
    },
];
