import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Checkbox,
    IconButton,
    styled,
    Tooltip,
    useMediaQuery,
    useTheme,
    Box,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    SortingRule,
    useFlexLayout,
    useRowSelect,
    useSortBy,
    useTable,
} from 'react-table';
import type { FeatureSchema } from 'openapi';
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
import { createLocalStorage } from 'utils/createLocalStorage';
import { FeatureStaleDialog } from 'component/common/FeatureStaleDialog/FeatureStaleDialog';
import { FeatureArchiveDialog } from 'component/common/FeatureArchiveDialog/FeatureArchiveDialog';
import { getColumnValues, includesFilter, useSearch } from 'hooks/useSearch';
import { Search } from 'component/common/Search/Search';
import { IFeatureToggleListItem } from 'interfaces/featureToggle';
import { FavoriteIconHeader } from 'component/common/Table/FavoriteIconHeader/FavoriteIconHeader';
import { FavoriteIconCell } from 'component/common/Table/cells/FavoriteIconCell/FavoriteIconCell';
import {
    ProjectEnvironmentType,
    useEnvironmentsRef,
} from './hooks/useEnvironmentsRef';
import { ActionsCell } from './ActionsCell/ActionsCell';
import { ColumnsMenu } from './ColumnsMenu/ColumnsMenu';
import { useStyles } from './ProjectFeatureToggles.styles';
import { usePinnedFavorites } from 'hooks/usePinnedFavorites';
import { useFavoriteFeaturesApi } from 'hooks/api/actions/useFavoriteFeaturesApi/useFavoriteFeaturesApi';
import { FeatureTagCell } from 'component/common/Table/cells/FeatureTagCell/FeatureTagCell';
import { useGlobalLocalStorage } from 'hooks/useGlobalLocalStorage';
import FileDownload from '@mui/icons-material/FileDownload';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { ExportDialog } from 'component/feature/FeatureToggleList/ExportDialog';
import { MemoizedRowSelectCell } from './RowSelectCell/RowSelectCell';
import { BatchSelectionActionsBar } from '../../../common/BatchSelectionActionsBar/BatchSelectionActionsBar';
import { ProjectFeaturesBatchActions } from './ProjectFeaturesBatchActions/ProjectFeaturesBatchActions';
import { MemoizedFeatureEnvironmentSeenCell } from '../../../common/Table/cells/FeatureSeenCell/FeatureEnvironmentSeenCell';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { ListItemType } from './ProjectFeatureToggles.types';
import { createFeatureToggleCell } from './FeatureToggleSwitch/createFeatureToggleCell';
import { useFeatureToggleSwitch } from './FeatureToggleSwitch/useFeatureToggleSwitch';
import useToast from 'hooks/useToast';

const StyledResponsiveButton = styled(ResponsiveButton)(() => ({
    whiteSpace: 'nowrap',
}));

interface IProjectFeatureTogglesProps {
    features: IProject['features'];
    environments: IProject['environments'];
    loading: boolean;
    onChange: () => void;
    total?: number;
    style?: React.CSSProperties;
}

const staticColumns = ['Select', 'Actions', 'name', 'favorite'];

const defaultSort: SortingRule<string> & {
    columns?: string[];
} = { id: 'createdAt', desc: true };

/**
 * @deprecated remove when flag `featureSearchFrontend` is removed
 */
export const ProjectFeatureToggles = ({
    features,
    loading,
    environments: newEnvironments = [],
    onChange,
    total,
    style = {},
}: IProjectFeatureTogglesProps) => {
    const { classes: styles } = useStyles();
    const theme = useTheme();
    const { setToastApiError } = useToast();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const [featureStaleDialogState, setFeatureStaleDialogState] = useState<{
        featureId?: string;
        stale?: boolean;
    }>({});
    const [featureArchiveState, setFeatureArchiveState] = useState<
        string | undefined
    >();
    const projectId = useRequiredPathParam('projectId');
    const { onToggle: onFeatureToggle, modals: featureToggleModals } =
        useFeatureToggleSwitch(projectId);

    const { value: storedParams, setValue: setStoredParams } =
        createLocalStorage(
            `${projectId}:FeatureToggleListTable:v1`,
            defaultSort,
        );
    const { value: globalStore, setValue: setGlobalStore } =
        useGlobalLocalStorage();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const environments = useEnvironmentsRef(
        loading
            ? [{ environment: 'a' }, { environment: 'b' }, { environment: 'c' }]
            : newEnvironments,
    );
    const { isFavoritesPinned, sortTypes, onChangeIsFavoritePinned } =
        usePinnedFavorites(
            searchParams.has('favorites')
                ? searchParams.get('favorites') === 'true'
                : globalStore.favorites,
        );
    const { favorite, unfavorite } = useFavoriteFeaturesApi();
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);
    const [showExportDialog, setShowExportDialog] = useState(false);
    const { uiConfig } = useUiConfig();

    const onFavorite = useCallback(
        async (feature: IFeatureToggleListItem) => {
            try {
                if (feature?.favorite) {
                    await unfavorite(projectId, feature.name);
                } else {
                    await favorite(projectId, feature.name);
                }
                onChange();
            } catch (error) {
                setToastApiError(
                    'Something went wrong, could not update favorite',
                );
            }
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
                        isActive={isFavoritesPinned}
                        onClick={onChangeIsFavoritePinned}
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
                        <MemoizedFeatureEnvironmentSeenCell feature={feature} />
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
                Cell: ({ value }: { value: string }) => (
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
            ...environments.map((value: ProjectEnvironmentType | string) => {
                const name =
                    typeof value === 'string'
                        ? value
                        : (value as ProjectEnvironmentType).environment;
                const isChangeRequestEnabled = isChangeRequestConfigured(name);
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
                    id: `environments.${name}`,
                    accessor: (row: ListItemType) =>
                        row.environments[name]?.enabled,
                    align: 'center',
                    Cell: FeatureToggleCell,
                    sortType: 'boolean',
                    filterName: name,
                    filterParsing: (value: boolean) =>
                        value ? 'enabled' : 'disabled',
                };
            }),

            {
                id: 'Actions',
                maxWidth: 56,
                width: 56,
                Cell: (props: { row: { original: ListItemType } }) => (
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
        [projectId, environments, loading],
    );

    const [searchValue, setSearchValue] = useState(
        searchParams.get('search') || '',
    );

    const [showTitle, setShowTitle] = useState(true);

    const featuresData = useMemo(
        () =>
            features.map((feature) => ({
                ...feature,
                environments: Object.fromEntries(
                    environments.map((env) => {
                        const thisEnv = feature?.environments.find(
                            (featureEnvironment) =>
                                featureEnvironment?.name === env,
                        );
                        return [
                            env,
                            {
                                name: env,
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
                            featureEnvironment.variantCount > 0 &&
                            featureEnvironment.enabled,
                    ) || false,
            })),
        [features, environments],
    );

    const {
        data: searchedData,
        getSearchText,
        getSearchContext,
    } = useSearch(columns, searchValue, featuresData);

    const data = useMemo(() => {
        if (loading) {
            return Array(6).fill({
                type: '-',
                name: 'Feature name',
                createdAt: new Date(),
                environments: {
                    production: { name: 'production', enabled: false },
                },
            }) as FeatureSchema[];
        }
        return searchedData;
    }, [loading, searchedData]);

    const initialState = useMemo(
        () => {
            const allColumnIds = columns
                .map(
                    (column: any) =>
                        (column?.id as string) ||
                        (typeof column?.accessor === 'string'
                            ? (column?.accessor as string)
                            : ''),
                )
                .filter(Boolean);
            let hiddenColumns = environments
                .filter((_, index) => index >= 3)
                .map((environment) => `environment:${environment}`);

            if (searchParams.has('columns')) {
                const columnsInParams =
                    searchParams.get('columns')?.split(',') || [];
                const visibleColumns = [...staticColumns, ...columnsInParams];
                hiddenColumns = allColumnIds.filter(
                    (columnId) => !visibleColumns.includes(columnId),
                );
            } else if (storedParams.columns) {
                const visibleColumns = [
                    ...staticColumns,
                    ...storedParams.columns,
                ];
                hiddenColumns = allColumnIds.filter(
                    (columnId) => !visibleColumns.includes(columnId),
                );
            }

            return {
                sortBy: [
                    {
                        id:
                            searchParams.get('sort') ||
                            storedParams.id ||
                            'createdAt',
                        desc: searchParams.has('order')
                            ? searchParams.get('order') === 'desc'
                            : storedParams.desc,
                    },
                ],
                hiddenColumns,
                selectedRowIds: {},
            };
        },
        [environments], // eslint-disable-line react-hooks/exhaustive-deps
    );

    const getRowId = useCallback((row: any) => row.name, []);
    const {
        allColumns,
        headerGroups,
        rows,
        state: { selectedRowIds, sortBy, hiddenColumns },
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
        if (isFavoritesPinned) {
            tableState.favorites = 'true';
        }
        tableState.columns = allColumns
            .map(({ id }) => id)
            .filter(
                (id) =>
                    !staticColumns.includes(id) && !hiddenColumns?.includes(id),
            )
            .join(',');

        setSearchParams(tableState, {
            replace: true,
        });
        setStoredParams((params) => ({
            ...params,
            id: sortBy[0].id,
            desc: sortBy[0].desc || false,
            columns: tableState.columns.split(','),
        }));
        setGlobalStore((params) => ({
            ...params,
            favorites: Boolean(isFavoritesPinned),
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        loading,
        sortBy,
        hiddenColumns,
        searchValue,
        setSearchParams,
        isFavoritesPinned,
    ]);

    return (
        <>
            <PageContent
                isLoading={loading}
                disablePadding
                className={styles.container}
                style={style}
                header={
                    <Box
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
                                                placeholder='Search and Filter'
                                                expandable
                                                initialValue={searchValue}
                                                onChange={setSearchValue}
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
                                        isCustomized={Boolean(
                                            storedParams.columns,
                                        )}
                                        setHiddenColumns={setHiddenColumns}
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
                                        initialValue={searchValue}
                                        onChange={setSearchValue}
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
                <SearchHighlightProvider value={getSearchText(searchValue)}>
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
                            condition={searchValue?.length > 0}
                            show={
                                <Box sx={{ padding: theme.spacing(3) }}>
                                    <TablePlaceholder>
                                        No feature toggles found matching
                                        &ldquo;
                                        {searchValue}
                                        &rdquo;
                                    </TablePlaceholder>
                                </Box>
                            }
                            elseShow={
                                <Box sx={{ padding: theme.spacing(3) }}>
                                    <TablePlaceholder>
                                        No feature toggles available. Get
                                        started by adding a new feature toggle.
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
                            environments={environments}
                        />
                    }
                />
                {featureToggleModals}
            </PageContent>
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
