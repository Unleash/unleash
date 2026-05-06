import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { useEnvironments } from 'hooks/api/getters/useEnvironments/useEnvironments';
import { CreateEnvironmentButton } from 'component/environments/CreateEnvironmentButton/CreateEnvironmentButton';
import {
    type ColumnDef,
    getCoreRowModel,
    getFilteredRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { Table, TablePlaceholder } from 'component/common/Table';
import { SortableTableHeader } from 'component/common/Table/SortableTableHeader/SortableTableHeader';
import { useCallback, useMemo, useState } from 'react';
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

const COLUMNS: ColumnDef<IEnvironment, unknown>[] = [
    {
        id: 'Icon',
        cell: ({ row: { original } }) => (
            <EnvironmentIconCell environment={original} />
        ),
        enableGlobalFilter: false,
        meta: { width: '1%', isDragHandle: true },
    },
    {
        id: 'name',
        header: 'Name',
        accessorKey: 'name',
        cell: ({ row: { original } }) => (
            <EnvironmentNameCell environment={original} />
        ),
        meta: { minWidth: 350 },
    },
    {
        id: 'type',
        header: 'Type',
        accessorKey: 'type',
        cell: HighlightCell,
    },
    {
        id: 'projectCount',
        header: 'Visible in',
        accessorFn: (row) =>
            row.projectCount === 1
                ? '1 project'
                : `${row.projectCount} projects`,
        cell: TextCell,
    },
    {
        id: 'apiTokenCount',
        header: 'API Tokens',
        accessorFn: (row) =>
            row.apiTokenCount === 1 ? '1 token' : `${row.apiTokenCount} tokens`,
        cell: TextCell,
    },
];

export const EnvironmentTable = () => {
    const { changeSortOrder } = useEnvironmentApi();
    const { setToastApiError } = useToast();
    const { environments, mutateEnvironments } = useEnvironments();
    const isFeatureEnabled = useUiFlag('EEA');
    const { isEnterprise } = useUiConfig();
    const [globalFilter, setGlobalFilter] = useState('');

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

    const columnsWithActions = useMemo<
        ColumnDef<IEnvironment, unknown>[]
    >(() => {
        const baseColumns: ColumnDef<IEnvironment, unknown>[] = [
            ...COLUMNS,
            ...(isFeatureEnabled
                ? [
                      {
                          id: 'Actions',
                          header: 'Actions',
                          cell: ({ row: { original } }) => (
                              <EnvironmentActionCell environment={original} />
                          ),
                          enableGlobalFilter: false,
                          meta: { width: '1%', align: 'center' as const },
                      } satisfies ColumnDef<IEnvironment, unknown>,
                  ]
                : []),
        ];
        if (isEnterprise()) {
            baseColumns.splice(2, 0, {
                id: 'changeRequest',
                header: 'Change request',
                accessorFn: (row) =>
                    Number.isInteger(row.requiredApprovals) ? 'yes' : 'no',
                cell: TextCell,
            });
        }

        return baseColumns;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isFeatureEnabled]);

    const table = useReactTable({
        columns: columnsWithActions,
        data: environments,
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        enableSorting: false,
        autoResetAll: false,
    });

    const rows = table.getRowModel().rows;

    const headerSearch = (
        <Search
            initialValue={globalFilter}
            onChange={(value) => setGlobalFilter(value)}
        />
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
                <Table rowHeight='compact'>
                    <SortableTableHeader tableInstance={table} />
                    <TableBody>
                        {rows.map((row) => (
                            <EnvironmentRow
                                row={row}
                                onMoveItem={onMoveItem}
                                key={row.original.name}
                            />
                        ))}
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
