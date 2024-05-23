import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { TablePlaceholder, VirtualizedTable } from 'component/common/Table';
import {
    type SortingRule,
    useFlexLayout,
    useRowSelect,
    useSortBy,
    useTable,
} from 'react-table';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { Checkbox, useMediaQuery } from '@mui/material';
import { sortTypes } from 'utils/sortTypes';
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
import type { FeatureSchema } from 'openapi';
import { useSearch } from 'hooks/useSearch';
import { FeatureArchivedCell } from './FeatureArchivedCell/FeatureArchivedCell';
import { useSearchParams } from 'react-router-dom';
import { ArchivedFeatureDeleteConfirm } from './ArchivedFeatureActionCell/ArchivedFeatureDeleteConfirm/ArchivedFeatureDeleteConfirm';
import type { IFeatureToggle } from 'interfaces/featureToggle';
import { useConditionallyHiddenColumns } from 'hooks/useConditionallyHiddenColumns';
import { RowSelectCell } from '../../project/Project/ProjectFeatureToggles/RowSelectCell/RowSelectCell';
import { BatchSelectionActionsBar } from '../../common/BatchSelectionActionsBar/BatchSelectionActionsBar';
import { ArchiveBatchActions } from './ArchiveBatchActions';
import { FeatureEnvironmentSeenCell } from 'component/common/Table/cells/FeatureSeenCell/FeatureEnvironmentSeenCell';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { ArchivedFeatureReviveConfirm } from './ArchivedFeatureActionCell/ArchivedFeatureReviveConfirm/ArchivedFeatureReviveConfirm';

export interface IFeaturesArchiveTableProps {
    archivedFeatures: FeatureSchema[];
    title: string;
    refetch: () => void;
    loading: boolean;
    storedParams: SortingRule<string>;
    setStoredParams: (
        newValue:
            | SortingRule<string>
            | ((prev: SortingRule<string>) => SortingRule<string>),
    ) => SortingRule<string>;
    projectId?: string;
}

export const ArchiveTable = ({
    archivedFeatures = [],
    loading,
    refetch,
    storedParams,
    setStoredParams,
    title,
    projectId,
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

    const { uiConfig } = useUiConfig();

    const columns = useMemo(
        () => [
            ...(projectId
                ? [
                      {
                          id: 'Select',
                          Header: ({ getToggleAllRowsSelectedProps }: any) => (
                              <Checkbox
                                  data-testid='select_all_rows'
                                  {...getToggleAllRowsSelectedProps()}
                              />
                          ),
                          Cell: ({ row }: any) => (
                              <RowSelectCell
                                  {...row?.getToggleRowSelectedProps?.()}
                              />
                          ),
                          maxWidth: 50,
                          disableSortBy: true,
                          hideInMenu: true,
                      },
                  ]
                : []),
            {
                Header: 'Seen',
                accessor: 'lastSeenAt',
                Cell: ({ value, row: { original: feature } }: any) => {
                    return <FeatureEnvironmentSeenCell feature={feature} />;
                },
                align: 'center',
                maxWidth: 80,
            },
            {
                Header: 'Type',
                accessor: 'type',
                width: 85,
                canSort: true,
                Cell: FeatureTypeCell,
                align: 'center',
            },
            {
                Header: 'Name',
                accessor: 'name',
                searchable: true,
                minWidth: 100,
                Cell: ({ value, row: { original } }: any) => (
                    <HighlightCell
                        value={value}
                        subtitle={original.description}
                    />
                ),
                sortType: 'alphanumeric',
            },
            {
                Header: 'Created',
                accessor: 'createdAt',
                width: 150,
                Cell: DateCell,
            },
            {
                Header: 'Archived',
                accessor: 'archivedAt',
                width: 150,
                Cell: FeatureArchivedCell,
            },
            ...(!projectId
                ? [
                      {
                          Header: 'Project ID',
                          accessor: 'project',
                          sortType: 'alphanumeric',
                          filterName: 'project',
                          searchable: true,
                          maxWidth: 170,
                          Cell: ({ value }: any) => (
                              <LinkCell
                                  title={value}
                                  to={`/projects/${value}`}
                              />
                          ),
                      },
                  ]
                : []),
            {
                Header: 'Actions',
                id: 'Actions',
                align: 'center',
                maxWidth: 120,
                canSort: false,
                Cell: ({ row: { original: feature } }: any) => (
                    <ArchivedFeatureActionCell
                        project={feature.project}
                        onRevive={() => {
                            setRevivedFeature(feature);
                            setReviveModalOpen(true);
                        }}
                        onDelete={() => {
                            setDeletedFeature(feature);
                            setDeleteModalOpen(true);
                        }}
                    />
                ),
            },
            // Always hidden -- for search
            {
                accessor: 'description',
                header: 'Description',
                searchable: true,
            },
        ],
        //eslint-disable-next-line
        [projectId],
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
        sortBy: [
            {
                id: searchParams.get('sort') || storedParams.id,
                desc: searchParams.has('order')
                    ? searchParams.get('order') === 'desc'
                    : storedParams.desc,
            },
        ],
        hiddenColumns: ['description'],
        selectedRowIds: {},
    }));

    const getRowId = useCallback((row: any) => row.name, []);

    const {
        headerGroups,
        rows,
        state: { sortBy, selectedRowIds },
        prepareRow,
        setHiddenColumns,
        toggleAllRowsSelected,
    } = useTable(
        {
            columns: columns as any[], // TODO: fix after `react-table` v8 update
            data,
            initialState,
            sortTypes,
            autoResetHiddenColumns: false,
            autoResetSelectedRows: false,
            disableSortRemove: true,
            autoResetSortBy: false,
            getRowId,
        },
        useFlexLayout,
        useSortBy,
        useRowSelect,
    );

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
        setHiddenColumns,
        columns,
    );

    useEffect(() => {
        if (loading) {
            return;
        }
        const tableState: Record<string, string> = {};
        tableState.sort = sortBy[0].id;
        if (sortBy[0].desc) {
            tableState.order = 'desc';
        }
        if (searchValue) {
            tableState.search = searchValue;
        }

        setSearchParams(tableState, {
            replace: true,
        });
        setStoredParams({ id: sortBy[0].id, desc: sortBy[0].desc || false });
    }, [loading, sortBy, searchValue]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <>
            <PageContent
                isLoading={loading}
                header={
                    <PageHeader
                        titleElement={`${title} (${
                            rows.length < data.length
                                ? `${rows.length} of ${data.length}`
                                : data.length
                        })`}
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
                <SearchHighlightProvider value={getSearchText(searchValue)}>
                    <VirtualizedTable
                        rows={rows}
                        headerGroups={headerGroups}
                        prepareRow={prepareRow}
                    />
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
                    projectId={projectId ?? deletedFeature?.project!}
                    open={deleteModalOpen}
                    setOpen={setDeleteModalOpen}
                    refetch={refetch}
                />
                <ArchivedFeatureReviveConfirm
                    revivedFeatures={[revivedFeature?.name!]}
                    projectId={projectId ?? revivedFeature?.project!}
                    open={reviveModalOpen}
                    setOpen={setReviveModalOpen}
                    refetch={refetch}
                />
            </PageContent>
            <ConditionallyRender
                condition={Boolean(projectId)}
                show={
                    <BatchSelectionActionsBar
                        count={Object.keys(selectedRowIds).length}
                    >
                        <ArchiveBatchActions
                            selectedIds={Object.keys(selectedRowIds)}
                            projectId={projectId!}
                            onConfirm={() => toggleAllRowsSelected(false)}
                        />
                    </BatchSelectionActionsBar>
                }
            />
        </>
    );
};
