import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { TablePlaceholder } from 'component/common/Table';
import { VirtualizedTable } from 'component/common/Table/VirtualizedTable/VirtualizedTable';
import {
    type ColumnDef,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { Alert, useMediaQuery } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';
import { DateCell } from 'component/common/Table/cells/DateCell/DateCell';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Search } from 'component/common/Search/Search';
import { FeatureTypeCell } from 'component/common/Table/cells/FeatureTypeCell/FeatureTypeCell';
import { LinkCell } from 'component/common/Table/cells/LinkCell/LinkCell';
import { ArchivedFeatureActionCell } from 'component/archive/ArchiveTable/ArchivedFeatureActionCell/ArchivedFeatureActionCell';
import { featuresPlaceholder } from 'component/feature/FeatureToggleList/FeatureToggleListTable';
import theme from 'themes/theme';
import type { FeatureSearchResponseSchema } from 'openapi';
import { useSearch } from 'hooks/useSearch';
import { FeatureArchivedCell } from 'component/archive/ArchiveTable/FeatureArchivedCell/FeatureArchivedCell';
import { useSearchParams } from 'react-router-dom';
import { ArchivedFeatureDeleteConfirm } from 'component/archive/ArchiveTable/ArchivedFeatureActionCell/ArchivedFeatureDeleteConfirm/ArchivedFeatureDeleteConfirm';
import type { IFeatureToggle } from 'interfaces/featureToggle';
import { useConditionallyHiddenColumns } from 'hooks/useConditionallyHiddenColumns';
import { FeatureEnvironmentSeenCell } from 'component/common/Table/cells/FeatureSeenCell/FeatureEnvironmentSeenCell';
import { ArchivedFeatureReviveConfirm } from 'component/archive/ArchiveTable/ArchivedFeatureActionCell/ArchivedFeatureReviveConfirm/ArchivedFeatureReviveConfirm';

type SortDescriptor = { id: string; desc?: boolean };

export interface IFeaturesArchiveTableProps {
    archivedFeatures: FeatureSearchResponseSchema[];
    title: string;
    refetch: () => void;
    loading: boolean;
    storedParams: SortDescriptor;
    setStoredParams: (
        newValue: SortDescriptor | ((prev: SortDescriptor) => SortDescriptor),
    ) => SortDescriptor;
}

export const ArchiveTable = ({
    archivedFeatures = [],
    loading,
    refetch,
    storedParams,
    setStoredParams,
    title,
}: IFeaturesArchiveTableProps) => {
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const isMediumScreen = useMediaQuery(theme.breakpoints.down('lg'));
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deletedFeature, setDeletedFeature] = useState<IFeatureToggle>();

    const [reviveModalOpen, setReviveModalOpen] = useState(false);
    const [revivedFeature, setRevivedFeature] = useState<IFeatureToggle>();

    const [searchParams, setSearchParams] = useSearchParams();

    const [searchValue, setSearchValue] = useState(
        searchParams.get('search') || '',
    );

    const columns = useMemo<ColumnDef<FeatureSearchResponseSchema, unknown>[]>(
        () => [
            {
                id: 'lastSeenAt',
                header: 'Seen',
                accessorKey: 'lastSeenAt',
                cell: ({ row: { original: feature } }) => (
                    <FeatureEnvironmentSeenCell feature={feature} />
                ),
                meta: { align: 'center', maxWidth: 80 },
            },
            {
                id: 'type',
                header: 'Type',
                accessorKey: 'type',
                cell: ({ getValue }) => (
                    <FeatureTypeCell value={getValue() as string} />
                ),
                meta: { width: 85, align: 'center' },
            },
            {
                id: 'name',
                header: 'Name',
                accessorKey: 'name',
                cell: ({ getValue, row: { original } }) => (
                    <HighlightCell
                        value={String(getValue() ?? '')}
                        subtitle={original.description ?? undefined}
                    />
                ),
                sortingFn: 'alphanumeric',
                meta: { searchable: true, minWidth: 100 },
            },
            {
                id: 'createdAt',
                header: 'Created',
                accessorKey: 'createdAt',
                cell: DateCell,
                meta: { width: 150 },
            },
            {
                id: 'archivedAt',
                header: 'Archived',
                accessorKey: 'archivedAt',
                cell: ({ getValue }) => (
                    <FeatureArchivedCell value={getValue() as string} />
                ),
                meta: { width: 150 },
            },
            {
                id: 'project',
                header: 'Project ID',
                accessorKey: 'project',
                sortingFn: 'alphanumeric',
                cell: ({ getValue }) => {
                    const value = String(getValue() ?? '');
                    return <LinkCell title={value} to={`/projects/${value}`} />;
                },
                meta: {
                    filterName: 'project',
                    searchable: true,
                    maxWidth: 170,
                },
            },
            {
                id: 'Actions',
                header: 'Actions',
                cell: ({ row: { original: feature } }) => (
                    <ArchivedFeatureActionCell
                        project={feature.project}
                        onRevive={() => {
                            setRevivedFeature(
                                feature as unknown as IFeatureToggle,
                            );
                            setReviveModalOpen(true);
                        }}
                        onDelete={() => {
                            setDeletedFeature(
                                feature as unknown as IFeatureToggle,
                            );
                            setDeleteModalOpen(true);
                        }}
                    />
                ),
                enableSorting: false,
                meta: { align: 'center', maxWidth: 120 },
            },
            // Always hidden -- for search
            {
                id: 'description',
                header: 'Description',
                accessorKey: 'description',
                meta: { searchable: true },
            },
        ],
        [],
    );

    const {
        data: searchedData,
        getSearchText,
        getSearchContext,
    } = useSearch(columns, searchValue, archivedFeatures);

    const data = useMemo(
        () => (loading ? featuresPlaceholder : searchedData),
        [searchedData, loading],
    );

    const [initialState] = useState(() => ({
        sorting: [
            {
                id: searchParams.get('sort') || storedParams.id,
                desc: searchParams.has('order')
                    ? searchParams.get('order') === 'desc'
                    : Boolean(storedParams.desc),
            },
        ],
        columnVisibility: { description: false },
    }));

    const getRowId = useCallback(
        (row: FeatureSearchResponseSchema) => row.name,
        [],
    );

    const table = useReactTable({
        columns,
        data: data as FeatureSearchResponseSchema[],
        initialState,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getRowId,
        autoResetAll: false,
        enableSortingRemoval: false,
    });

    useConditionallyHiddenColumns(
        [
            {
                condition: isSmallScreen,
                columns: ['type', 'createdAt'],
            },
            {
                condition: isMediumScreen,
                columns: ['lastSeenAt', 'stale'],
            },
        ],
        table.setColumnVisibility,
        columns,
    );

    const sorting = table.getState().sorting;
    const rows = table.getRowModel().rows;

    useEffect(() => {
        if (loading) {
            return;
        }
        const sortRule = sorting[0];
        if (!sortRule) {
            return;
        }
        const tableState: Record<string, string> = {};
        tableState.sort = sortRule.id;
        if (sortRule.desc) {
            tableState.order = 'desc';
        }
        if (searchValue) {
            tableState.search = searchValue;
        }

        setSearchParams(tableState, {
            replace: true,
        });
        setStoredParams({ id: sortRule.id, desc: sortRule.desc || false });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, sorting, searchValue]);

    return (
        <>
            <PageContent
                isLoading={loading}
                header={
                    <PageHeader
                        titleElement={`${title} (${rows.length})`}
                        actions={
                            <Search
                                initialValue={searchValue}
                                onChange={setSearchValue}
                                hasFilters
                                getSearchContext={getSearchContext}
                            />
                        }
                    />
                }
            >
                {rows.length >= 50 && (
                    <Alert color='info' sx={{ mb: 2 }}>
                        A maximum of 50 archived flags are displayed. If you
                        don't see the one you're looking for, try using search.
                    </Alert>
                )}
                <SearchHighlightProvider value={getSearchText(searchValue)}>
                    <VirtualizedTable tableInstance={table} />
                </SearchHighlightProvider>
                <ConditionallyRender
                    condition={rows.length === 0}
                    show={() => (
                        <ConditionallyRender
                            condition={searchValue?.length > 0}
                            show={
                                <TablePlaceholder>
                                    No feature flags found matching &ldquo;
                                    {searchValue}&rdquo;
                                </TablePlaceholder>
                            }
                            elseShow={
                                <TablePlaceholder>
                                    None of the feature flags were archived yet.
                                </TablePlaceholder>
                            }
                        />
                    )}
                />
                <ArchivedFeatureDeleteConfirm
                    deletedFeatures={[deletedFeature?.name!]}
                    projectId={deletedFeature?.project!}
                    open={deleteModalOpen}
                    setOpen={setDeleteModalOpen}
                    refetch={refetch}
                />
                <ArchivedFeatureReviveConfirm
                    revivedFeatures={[revivedFeature?.name!]}
                    projectId={revivedFeature?.project!}
                    open={reviveModalOpen}
                    setOpen={setReviveModalOpen}
                    refetch={refetch}
                />
            </PageContent>
        </>
    );
};
