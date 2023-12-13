import React, {
    type CSSProperties,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import {
    Checkbox,
    IconButton,
    styled,
    Tooltip,
    useMediaQuery,
    Box,
    useTheme,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
    useFlexLayout,
    usePagination,
    useRowSelect,
    useSortBy,
    useTable,
} from 'react-table';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { PageContent } from 'component/common/PageContent/PageContent';
import ResponsiveButton from 'component/common/ResponsiveButton/ResponsiveButton';
import { getCreateTogglePath } from 'utils/routePathHelpers';
import { CREATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { DateCell } from 'component/common/Table/cells/DateCell/DateCell';
import { LinkCell } from 'component/common/Table/cells/LinkCell/LinkCell';
import { FeatureSeenCell } from 'component/common/Table/cells/FeatureSeenCell/FeatureSeenCell';
import { FeatureTypeCell } from 'component/common/Table/cells/FeatureTypeCell/FeatureTypeCell';
import { IProject } from 'interfaces/project';
import { TablePlaceholder, VirtualizedTable } from 'component/common/Table';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { FeatureStaleDialog } from 'component/common/FeatureStaleDialog/FeatureStaleDialog';
import { FeatureArchiveDialog } from 'component/common/FeatureArchiveDialog/FeatureArchiveDialog';
import { getColumnValues, includesFilter, useSearch } from 'hooks/useSearch';
import { Search } from 'component/common/Search/Search';
import { IFeatureToggleListItem } from 'interfaces/featureToggle';
import { FavoriteIconHeader } from 'component/common/Table/FavoriteIconHeader/FavoriteIconHeader';
import { FavoriteIconCell } from 'component/common/Table/cells/FavoriteIconCell/FavoriteIconCell';
import { ProjectEnvironmentType } from './hooks/useEnvironmentsRef';
import { ActionsCell } from './ActionsCell/ActionsCell';
import { ColumnsMenu } from './ColumnsMenu/ColumnsMenu';
import { useStyles } from './ProjectFeatureToggles.styles';
import { useFavoriteFeaturesApi } from 'hooks/api/actions/useFavoriteFeaturesApi/useFavoriteFeaturesApi';
import { FeatureTagCell } from 'component/common/Table/cells/FeatureTagCell/FeatureTagCell';
import FileDownload from '@mui/icons-material/FileDownload';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { ExportDialog } from 'component/feature/FeatureToggleList/ExportDialog';
import { MemoizedRowSelectCell } from './RowSelectCell/RowSelectCell';
import { BatchSelectionActionsBar } from 'component/common/BatchSelectionActionsBar/BatchSelectionActionsBar';
import { ProjectFeaturesBatchActions } from './ProjectFeaturesBatchActions/ProjectFeaturesBatchActions';
import { MemoizedFeatureEnvironmentSeenCell } from 'component/common/Table/cells/FeatureSeenCell/FeatureEnvironmentSeenCell';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { ListItemType } from './ProjectFeatureToggles.types';
import { createFeatureToggleCell } from './FeatureToggleSwitch/createFeatureToggleCell';
import { useFeatureToggleSwitch } from './FeatureToggleSwitch/useFeatureToggleSwitch';
import useLoading from 'hooks/useLoading';
import { StickyPaginationBar } from '../../../common/Table/StickyPaginationBar/StickyPaginationBar';
import {
    DEFAULT_PAGE_LIMIT,
    useFeatureSearch,
} from 'hooks/api/getters/useFeatureSearch/useFeatureSearch';
import mapValues from 'lodash.mapvalues';
import { usePersistentTableState } from 'hooks/usePersistentTableState';
import { BooleansStringParam } from 'utils/serializeQueryParams';
import {
    NumberParam,
    StringParam,
    ArrayParam,
    withDefault,
} from 'use-query-params';

const StyledResponsiveButton = styled(ResponsiveButton)(() => ({
    whiteSpace: 'nowrap',
}));

interface IPaginatedProjectFeatureTogglesProps {
    environments: IProject['environments'];
    style?: CSSProperties;
    refreshInterval?: number;
    storageKey?: string;
}

const staticColumns = ['Select', 'Actions', 'name', 'favorite'];

export const PaginatedProjectFeatureToggles = ({
    environments,
    style,
    refreshInterval = 15 * 1000,
    storageKey = 'project-feature-toggles',
}: IPaginatedProjectFeatureTogglesProps) => {
    const projectId = useRequiredPathParam('projectId');
    const [tableState, setTableState] = usePersistentTableState(
        `${storageKey}-${projectId}`,
        {
            offset: withDefault(NumberParam, 0),
            limit: withDefault(NumberParam, DEFAULT_PAGE_LIMIT),
            query: StringParam,
            favoritesFirst: withDefault(BooleansStringParam, true),
            sortBy: withDefault(StringParam, 'createdAt'),
            sortOrder: withDefault(StringParam, 'desc'),
            columns: ArrayParam,
        },
    );

    const { features, total, refetch, loading, initialLoad } = useFeatureSearch(
        mapValues({ ...tableState, project: `IS:${projectId}` }, (value) =>
            value ? `${value}` : undefined,
        ),
        {
            refreshInterval,
        },
    );
    const onChange = refetch;

    const { classes: styles } = useStyles();
    const bodyLoadingRef = useLoading(loading);
    const headerLoadingRef = useLoading(initialLoad);
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const [featureStaleDialogState, setFeatureStaleDialogState] = useState<{
        featureId?: string;
        stale?: boolean;
    }>({});
    const [featureArchiveState, setFeatureArchiveState] = useState<
        string | undefined
    >();
    const [isCustomColumns, setIsCustomColumns] = useState(
        Boolean(tableState.columns),
    );
    const { onToggle: onFeatureToggle, modals: featureToggleModals } =
        useFeatureToggleSwitch(projectId);

    const navigate = useNavigate();
    const { favorite, unfavorite } = useFavoriteFeaturesApi();
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);
    const [showExportDialog, setShowExportDialog] = useState(false);
    const { uiConfig } = useUiConfig();

    const onFavorite = useCallback(
        async (feature: IFeatureToggleListItem) => {
            if (feature?.favorite) {
                await unfavorite(projectId, feature.name);
            } else {
                await favorite(projectId, feature.name);
            }
            onChange();
        },
        [projectId, onChange],
    );

    const showTagsColumn = useMemo(
        () => features.some((feature) => feature?.tags?.length),
        [features],
    );

    const columns = useMemo(
        () => [
            {
                id: 'Select',
                Header: ({ getToggleAllRowsSelectedProps }: any) => (
                    <Checkbox {...getToggleAllRowsSelectedProps()} />
                ),
                Cell: ({ row }: any) => (
                    <MemoizedRowSelectCell
                        {...row?.getToggleRowSelectedProps?.()}
                    />
                ),
                maxWidth: 50,
                disableSortBy: true,
                hideInMenu: true,
                styles: {
                    borderRadius: 0,
                },
            },
            {
                id: 'favorite',
                Header: (
                    <FavoriteIconHeader
                        isActive={tableState.favoritesFirst}
                        onClick={() =>
                            setTableState({
                                favoritesFirst: !tableState.favoritesFirst,
                            })
                        }
                    />
                ),
                accessor: 'favorite',
                Cell: ({ row: { original: feature } }: any) => (
                    <FavoriteIconCell
                        value={feature?.favorite}
                        onClick={() => onFavorite(feature)}
                    />
                ),
                maxWidth: 50,
                disableSortBy: true,
                hideInMenu: true,
            },
            {
                Header: 'Seen',
                accessor: 'lastSeenAt',
                Cell: ({ value, row: { original: feature } }: any) => {
                    return (
                        <MemoizedFeatureEnvironmentSeenCell
                            feature={feature}
                            data-loading
                        />
                    );
                },
                align: 'center',
                maxWidth: 80,
            },
            {
                Header: 'Type',
                accessor: 'type',
                Cell: FeatureTypeCell,
                align: 'center',
                filterName: 'type',
                maxWidth: 80,
            },
            {
                Header: 'Name',
                accessor: 'name',
                Cell: ({
                    value,
                }: {
                    value: string;
                }) => (
                    <Tooltip title={value} arrow describeChild>
                        <span>
                            <LinkCell
                                title={value}
                                to={`/projects/${projectId}/features/${value}`}
                            />
                        </span>
                    </Tooltip>
                ),
                minWidth: 100,
                sortType: 'alphanumeric',
                searchable: true,
            },
            ...(showTagsColumn
                ? [
                      {
                          id: 'tags',
                          Header: 'Tags',
                          accessor: (row: IFeatureToggleListItem) =>
                              row.tags
                                  ?.map(({ type, value }) => `${type}:${value}`)
                                  .join('\n') || '',
                          Cell: FeatureTagCell,
                          width: 80,
                          searchable: true,
                          filterName: 'tags',
                          filterBy(
                              row: IFeatureToggleListItem,
                              values: string[],
                          ) {
                              return includesFilter(
                                  getColumnValues(this, row),
                                  values,
                              );
                          },
                      },
                  ]
                : []),
            {
                Header: 'Created',
                accessor: 'createdAt',
                Cell: DateCell,
                minWidth: 120,
            },
            ...environments.map(
                (projectEnvironment: ProjectEnvironmentType | string) => {
                    const name =
                        typeof projectEnvironment === 'string'
                            ? projectEnvironment
                            : (projectEnvironment as ProjectEnvironmentType)
                                  .environment;
                    const isChangeRequestEnabled =
                        isChangeRequestConfigured(name);
                    const FeatureToggleCell = createFeatureToggleCell(
                        projectId,
                        name,
                        isChangeRequestEnabled,
                        onChange,
                        onFeatureToggle,
                    );

                    return {
                        Header: loading ? () => '' : name,
                        maxWidth: 90,
                        id: `environment:${name}`,
                        accessor: (row: ListItemType) => {
                            return row.environments?.[name]?.enabled;
                        },
                        align: 'center',
                        Cell: FeatureToggleCell,
                        sortType: 'boolean',
                        sortDescFirst: true,
                        filterName: name,
                        filterParsing: (value: boolean) =>
                            value ? 'enabled' : 'disabled',
                    };
                },
            ),
            {
                id: 'Actions',
                maxWidth: 56,
                width: 56,
                Cell: (props: {
                    row: {
                        original: ListItemType;
                    };
                }) => (
                    <ActionsCell
                        projectId={projectId}
                        onOpenArchiveDialog={setFeatureArchiveState}
                        onOpenStaleDialog={setFeatureStaleDialogState}
                        {...props}
                    />
                ),
                disableSortBy: true,
                hideInMenu: true,
                styles: {
                    borderRadius: 0,
                },
            },
        ],
        [projectId, environments, loading, tableState.favoritesFirst, onChange],
    );

    const [showTitle, setShowTitle] = useState(true);

    const featuresData = useMemo(
        () =>
            features.map((feature) => ({
                ...feature,
                environments: Object.fromEntries(
                    environments.map((env) => {
                        const thisEnv = feature?.environments?.find(
                            (featureEnvironment) =>
                                featureEnvironment?.name === env.environment,
                        );
                        return [
                            env.environment,
                            {
                                name: env.environment,
                                enabled: thisEnv?.enabled || false,
                                variantCount: thisEnv?.variantCount || 0,
                                lastSeenAt: thisEnv?.lastSeenAt,
                                type: thisEnv?.type,
                                hasStrategies: thisEnv?.hasStrategies,
                                hasEnabledStrategies:
                                    thisEnv?.hasEnabledStrategies,
                            },
                        ];
                    }),
                ),
                someEnabledEnvironmentHasVariants:
                    feature.environments?.some(
                        (featureEnvironment) =>
                            featureEnvironment.variantCount &&
                            featureEnvironment.variantCount > 0 &&
                            featureEnvironment.enabled,
                    ) || false,
            })),
        [features, environments],
    );

    const { getSearchText, getSearchContext } = useSearch(
        columns,
        tableState.query || '',
        featuresData,
    );

    const allColumnIds = columns
        .map(
            (column: any) =>
                (column?.id as string) ||
                (typeof column?.accessor === 'string'
                    ? (column?.accessor as string)
                    : ''),
        )
        .filter(Boolean);

    const initialState = useMemo(
        () => ({
            sortBy: [
                {
                    id: tableState.sortBy || 'createdAt',
                    desc: tableState.sortOrder === 'desc',
                },
            ],
            ...(tableState.columns
                ? {
                      hiddenColumns: allColumnIds.filter(
                          (id) =>
                              !tableState.columns?.includes(id) &&
                              !staticColumns.includes(id),
                      ),
                  }
                : {}),
            pageSize: tableState.limit,
            pageIndex: tableState.offset * tableState.limit,
            selectedRowIds: {},
        }),
        [initialLoad],
    );

    const data = useMemo(() => {
        if (initialLoad || loading) {
            const loadingData = Array(tableState.limit)
                .fill(null)
                .map((_, index) => ({
                    id: index, // Assuming `id` is a required property
                    type: '-',
                    name: `Feature name ${index}`,
                    createdAt: new Date().toISOString(),
                    environments: [
                        {
                            name: 'production',
                            enabled: false,
                        },
                    ],
                }));
            // Coerce loading data to FeatureSchema[]
            return loadingData as unknown as typeof featuresData;
        }
        return featuresData;
    }, [loading, featuresData]);

    const pageCount = useMemo(
        () => Math.ceil((total || 0) / tableState.limit),
        [total, tableState.limit],
    );
    const getRowId = useCallback((row: any) => row.name, []);

    const {
        allColumns,
        headerGroups,
        rows,
        state: { pageIndex, pageSize, hiddenColumns, selectedRowIds, sortBy },
        canNextPage,
        canPreviousPage,
        previousPage,
        nextPage,
        setPageSize,
        prepareRow,
        setHiddenColumns,
        toggleAllRowsSelected,
    } = useTable(
        {
            columns: columns as any[], // TODO: fix after `react-table` v8 update
            data,
            initialState,
            autoResetHiddenColumns: false,
            autoResetSelectedRows: false,
            disableSortRemove: true,
            autoResetSortBy: false,
            manualSortBy: true,
            manualPagination: true,
            pageCount,
            getRowId,
        },
        useFlexLayout,
        useSortBy,
        usePagination,
        useRowSelect,
    );

    // Refetching - https://github.com/TanStack/table/blob/v7/docs/src/pages/docs/faq.md#how-can-i-use-the-table-state-to-fetch-new-data
    useEffect(() => {
        setTableState({
            offset: pageIndex * pageSize,
            limit: pageSize,
            sortBy: sortBy[0]?.id || 'createdAt',
            sortOrder: sortBy[0]?.desc ? 'desc' : 'asc',
        });
    }, [pageIndex, pageSize, sortBy]);

    useEffect(() => {
        // FIXME: refactor column visibility logic when switching to react-table v8
        if (!loading && isCustomColumns) {
            setTableState({
                columns:
                    hiddenColumns !== undefined
                        ? allColumnIds.filter(
                              (id) =>
                                  !hiddenColumns.includes(id) &&
                                  !staticColumns.includes(id),
                          )
                        : undefined,
            });
        }
    }, [loading, isCustomColumns, hiddenColumns]);

    const showPaginationBar = Boolean(total && total > pageSize);
    const paginatedStyles = showPaginationBar
        ? {
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
          }
        : {};

    return (
        <>
            <PageContent
                disableLoading
                disablePadding
                className={styles.container}
                style={{ ...paginatedStyles, ...style }}
                header={
                    <Box
                        ref={headerLoadingRef}
                        aria-busy={initialLoad}
                        aria-live='polite'
                        sx={(theme) => ({
                            padding: `${theme.spacing(2.5)} ${theme.spacing(
                                3.125,
                            )}`,
                        })}
                    >
                        <PageHeader
                            titleElement={
                                showTitle
                                    ? `Feature toggles (${
                                          total || rows.length
                                      })`
                                    : null
                            }
                            actions={
                                <>
                                    <ConditionallyRender
                                        condition={!isSmallScreen}
                                        show={
                                            <Search
                                                data-loading
                                                placeholder='Search and Filter'
                                                expandable
                                                initialValue={
                                                    tableState.query || ''
                                                }
                                                onChange={(value) => {
                                                    setTableState({
                                                        query: value,
                                                    });
                                                }}
                                                onFocus={() =>
                                                    setShowTitle(false)
                                                }
                                                onBlur={() =>
                                                    setShowTitle(true)
                                                }
                                                hasFilters
                                                getSearchContext={
                                                    getSearchContext
                                                }
                                                id='projectFeatureToggles'
                                            />
                                        }
                                    />
                                    <ColumnsMenu
                                        allColumns={allColumns}
                                        staticColumns={staticColumns}
                                        dividerAfter={['createdAt']}
                                        dividerBefore={['Actions']}
                                        isCustomized={isCustomColumns}
                                        setHiddenColumns={setHiddenColumns}
                                        onCustomize={() =>
                                            setIsCustomColumns(true)
                                        }
                                    />
                                    <PageHeader.Divider
                                        sx={{ marginLeft: 0 }}
                                    />
                                    <ConditionallyRender
                                        condition={Boolean(
                                            uiConfig?.flags
                                                ?.featuresExportImport,
                                        )}
                                        show={
                                            <Tooltip
                                                title='Export toggles visible in the table below'
                                                arrow
                                            >
                                                <IconButton
                                                    data-loading
                                                    onClick={() =>
                                                        setShowExportDialog(
                                                            true,
                                                        )
                                                    }
                                                    sx={(theme) => ({
                                                        marginRight:
                                                            theme.spacing(2),
                                                    })}
                                                >
                                                    <FileDownload />
                                                </IconButton>
                                            </Tooltip>
                                        }
                                    />
                                    <StyledResponsiveButton
                                        onClick={() =>
                                            navigate(
                                                getCreateTogglePath(projectId),
                                            )
                                        }
                                        maxWidth='960px'
                                        Icon={Add}
                                        projectId={projectId}
                                        permission={CREATE_FEATURE}
                                        data-testid='NAVIGATE_TO_CREATE_FEATURE'
                                    >
                                        New feature toggle
                                    </StyledResponsiveButton>
                                </>
                            }
                        >
                            <ConditionallyRender
                                condition={isSmallScreen}
                                show={
                                    <Search
                                        initialValue={tableState.query || ''}
                                        onChange={(value) => {
                                            setTableState({ query: value });
                                        }}
                                        hasFilters
                                        getSearchContext={getSearchContext}
                                        id='projectFeatureToggles'
                                    />
                                }
                            />
                        </PageHeader>
                    </Box>
                }
            >
                <div
                    ref={bodyLoadingRef}
                    aria-busy={loading}
                    aria-live='polite'
                >
                    <SearchHighlightProvider
                        value={getSearchText(tableState.query || '')}
                    >
                        <VirtualizedTable
                            rows={rows}
                            headerGroups={headerGroups}
                            prepareRow={prepareRow}
                        />
                    </SearchHighlightProvider>

                    <ConditionallyRender
                        condition={rows.length === 0}
                        show={
                            <ConditionallyRender
                                condition={(tableState.query || '')?.length > 0}
                                show={
                                    <Box sx={{ padding: theme.spacing(3) }}>
                                        <TablePlaceholder>
                                            No feature toggles found matching
                                            &ldquo;
                                            {tableState.query}
                                            &rdquo;
                                        </TablePlaceholder>
                                    </Box>
                                }
                                elseShow={
                                    <Box sx={{ padding: theme.spacing(3) }}>
                                        <TablePlaceholder>
                                            No feature toggles available. Get
                                            started by adding a new feature
                                            toggle.
                                        </TablePlaceholder>
                                    </Box>
                                }
                            />
                        }
                    />
                    <FeatureStaleDialog
                        isStale={featureStaleDialogState.stale === true}
                        isOpen={Boolean(featureStaleDialogState.featureId)}
                        onClose={() => {
                            setFeatureStaleDialogState({});
                            onChange();
                        }}
                        featureId={featureStaleDialogState.featureId || ''}
                        projectId={projectId}
                    />
                    <FeatureArchiveDialog
                        isOpen={Boolean(featureArchiveState)}
                        onConfirm={onChange}
                        onClose={() => {
                            setFeatureArchiveState(undefined);
                        }}
                        featureIds={[featureArchiveState || '']}
                        projectId={projectId}
                    />
                    <ConditionallyRender
                        condition={
                            Boolean(uiConfig?.flags?.featuresExportImport) &&
                            !loading
                        }
                        show={
                            <ExportDialog
                                showExportDialog={showExportDialog}
                                data={data}
                                onClose={() => setShowExportDialog(false)}
                                environments={environments.map(
                                    ({ environment }) => environment,
                                )}
                            />
                        }
                    />
                    {featureToggleModals}
                </div>
            </PageContent>
            <ConditionallyRender
                condition={showPaginationBar}
                show={
                    <StickyPaginationBar
                        totalItems={total || 0}
                        pageIndex={pageIndex}
                        fetchNextPage={nextPage}
                        fetchPrevPage={previousPage}
                        pageSize={pageSize}
                        setPageLimit={setPageSize}
                    />
                }
            />
            <BatchSelectionActionsBar
                count={Object.keys(selectedRowIds).length}
            >
                <ProjectFeaturesBatchActions
                    selectedIds={Object.keys(selectedRowIds)}
                    data={features}
                    projectId={projectId}
                    onResetSelection={() => toggleAllRowsSelected(false)}
                />
            </BatchSelectionActionsBar>
        </>
    );
};
