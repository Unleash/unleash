import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { useEnvironments } from 'hooks/api/getters/useEnvironments/useEnvironments';
import { CreateEnvironmentButton } from 'component/environments/CreateEnvironmentButton/CreateEnvironmentButton';
import { useTable, useGlobalFilter } from 'react-table';
import {
    SortableTableHeader,
    Table,
    TablePlaceholder,
} from 'component/common/Table';
import { useCallback, useMemo } from 'react';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { Alert, styled, TableBody } from '@mui/material';
import type { OnMoveItem } from 'hooks/useDragItem';
import useToast from 'hooks/useToast';
import useEnvironmentApi, {
    createSortOrderPayload,
} from 'hooks/api/actions/useEnvironmentApi/useEnvironmentApi';
import { formatUnknownError } from 'utils/formatUnknownError';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { EnvironmentRow } from './EnvironmentRow/EnvironmentRow.tsx';
import { EnvironmentNameCell } from './EnvironmentNameCell/EnvironmentNameCell.tsx';
import { EnvironmentActionCell } from './EnvironmentActionCell/EnvironmentActionCell.tsx';
import { EnvironmentIconCell } from './EnvironmentIconCell/EnvironmentIconCell.tsx';
import { Search } from 'component/common/Search/Search';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import type { IEnvironment } from 'interfaces/environments';
import { useUiFlag } from 'hooks/useUiFlag';
import { PremiumFeature } from 'component/common/PremiumFeature/PremiumFeature';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

const StyledAlert = styled(Alert)(({ theme }) => ({
    marginBottom: theme.spacing(4),
}));

export const EnvironmentTable = () => {
    const { changeSortOrder } = useEnvironmentApi();
    const { setToastApiError } = useToast();
    const { environments, mutateEnvironments } = useEnvironments();
    const isFeatureEnabled = useUiFlag('EEA');
    const { isEnterprise } = useUiConfig();

    const onMoveItem: OnMoveItem = useCallback(
        async ({ dragIndex, dropIndex, save }) => {
            const oldEnvironments = environments || [];
            const newEnvironments = [...oldEnvironments];
            const movedEnvironment = newEnvironments.splice(dragIndex, 1)[0];
            newEnvironments.splice(dropIndex, 0, movedEnvironment);

            await mutateEnvironments(newEnvironments);

            if (save) {
                try {
                    await changeSortOrder(
                        createSortOrderPayload(newEnvironments),
                    );
                } catch (error: unknown) {
                    setToastApiError(formatUnknownError(error));
                }
            }
        },
        [changeSortOrder, environments, mutateEnvironments, setToastApiError],
    );

    const columnsWithActions = useMemo(() => {
        const baseColumns = [
            ...COLUMNS,
            ...(isFeatureEnabled
                ? [
                      {
                          Header: 'Actions',
                          id: 'Actions',
                          align: 'center',
                          width: '1%',
                          Cell: ({
                              row: { original },
                          }: {
                              row: { original: IEnvironment };
                          }) => (
                              <EnvironmentActionCell environment={original} />
                          ),
                          disableGlobalFilter: true,
                      },
                  ]
                : []),
        ];
        if (isEnterprise()) {
            baseColumns.splice(2, 0, {
                Header: 'Change request',
                accessor: (row: IEnvironment) =>
                    Number.isInteger(row.requiredApprovals) ? 'yes' : 'no',
                Cell: TextCell,
            });
        }

        return baseColumns;
    }, [isFeatureEnabled]);

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
            columns: columnsWithActions as any,
            data: environments,
            disableSortBy: true,
        },
        useGlobalFilter,
    );

    const headerSearch = (
        <Search initialValue={globalFilter} onChange={setGlobalFilter} />
    );

    const headerActions = (
        <>
            {headerSearch}
            <PageHeader.Divider />
            <CreateEnvironmentButton />
        </>
    );
    const count = rows.length;
    const header = (
        <PageHeader title={`Environments (${count})`} actions={headerActions} />
    );

    if (!isFeatureEnabled) {
        return (
            <PageContent header={header}>
                <PremiumFeature feature='environments' />
            </PageContent>
        );
    }

    return (
        <PageContent header={header}>
            <StyledAlert severity='info'>
                This is the order of environments that you have today in each
                feature flag. Rearranging them here will change also the order
                inside each feature flag.
            </StyledAlert>
            <SearchHighlightProvider value={globalFilter}>
                <Table {...getTableProps()} rowHeight='compact'>
                    <SortableTableHeader headerGroups={headerGroups as any} />
                    <TableBody {...getTableBodyProps()}>
                        {rows.map((row) => {
                            prepareRow(row);
                            return (
                                <EnvironmentRow
                                    row={row as any}
                                    onMoveItem={onMoveItem}
                                    key={row.original.name}
                                />
                            );
                        })}
                    </TableBody>
                </Table>
            </SearchHighlightProvider>
            <ConditionallyRender
                condition={rows.length === 0}
                show={
                    <ConditionallyRender
                        condition={globalFilter?.length > 0}
                        show={
                            <TablePlaceholder>
                                No environments found matching &ldquo;
                                {globalFilter}
                                &rdquo;
                            </TablePlaceholder>
                        }
                        elseShow={
                            <TablePlaceholder>
                                No environments available. Get started by adding
                                one.
                            </TablePlaceholder>
                        }
                    />
                }
            />
        </PageContent>
    );
};

const COLUMNS = [
    {
        id: 'Icon',
        width: '1%',
        Cell: ({ row: { original } }: { row: { original: IEnvironment } }) => (
            <EnvironmentIconCell environment={original} />
        ),
        disableGlobalFilter: true,
        isDragHandle: true,
    },
    {
        Header: 'Name',
        accessor: 'name',
        Cell: ({ row: { original } }: { row: { original: IEnvironment } }) => (
            <EnvironmentNameCell environment={original} />
        ),
        minWidth: 350,
    },
    {
        Header: 'Type',
        accessor: 'type',
        Cell: HighlightCell,
    },
    {
        Header: 'Visible in',
        accessor: (row: IEnvironment) =>
            row.projectCount === 1
                ? '1 project'
                : `${row.projectCount} projects`,
        Cell: TextCell,
    },
    {
        Header: 'API Tokens',
        accessor: (row: IEnvironment) =>
            row.apiTokenCount === 1 ? '1 token' : `${row.apiTokenCount} tokens`,
        Cell: TextCell,
    },
];
