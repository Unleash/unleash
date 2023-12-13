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
import { PaginatedTable, VirtualizedTable } from 'component/common/Table';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { FeatureStaleDialog } from 'component/common/FeatureStaleDialog/FeatureStaleDialog';
import { FeatureArchiveDialog } from 'component/common/FeatureArchiveDialog/FeatureArchiveDialog';
import { getColumnValues, includesFilter, useSearch } from 'hooks/useSearch';
import { Search } from 'component/common/Search/Search';
import { IFeatureToggleListItem } from 'interfaces/featureToggle';
import { FavoriteIconHeader } from 'component/common/Table/FavoriteIconHeader/FavoriteIconHeader';
import { FavoriteIconCell } from 'component/common/Table/cells/FavoriteIconCell/FavoriteIconCell';
import { ProjectEnvironmentType } from '../../ProjectFeatureToggles/hooks/useEnvironmentsRef';
import { ActionsCell } from '../../ProjectFeatureToggles/ActionsCell/ActionsCell';
import { ExperimentalColumnsMenu as ColumnsMenu } from './ExperimentalColumnsMenu/ExperimentalColumnsMenu';
import { useStyles } from '../../ProjectFeatureToggles/ProjectFeatureToggles.styles';
import { useFavoriteFeaturesApi } from 'hooks/api/actions/useFavoriteFeaturesApi/useFavoriteFeaturesApi';
import { FeatureTagCell } from 'component/common/Table/cells/FeatureTagCell/FeatureTagCell';
import FileDownload from '@mui/icons-material/FileDownload';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { ExportDialog } from 'component/feature/FeatureToggleList/ExportDialog';
import { MemoizedRowSelectCell } from '../../ProjectFeatureToggles/RowSelectCell/RowSelectCell';
import { BatchSelectionActionsBar } from 'component/common/BatchSelectionActionsBar/BatchSelectionActionsBar';
import { ProjectFeaturesBatchActions } from '../../ProjectFeatureToggles/ProjectFeaturesBatchActions/ProjectFeaturesBatchActions';
import { MemoizedFeatureEnvironmentSeenCell } from 'component/common/Table/cells/FeatureSeenCell/FeatureEnvironmentSeenCell';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { ListItemType } from '../../ProjectFeatureToggles/ProjectFeatureToggles.types';
import { createFeatureToggleCell } from '../../ProjectFeatureToggles/FeatureToggleSwitch/createFeatureToggleCell';
import { useFeatureToggleSwitch } from '../../ProjectFeatureToggles/FeatureToggleSwitch/useFeatureToggleSwitch';
import useLoading from 'hooks/useLoading';
import { StickyPaginationBar } from '../../../../common/Table/StickyPaginationBar/StickyPaginationBar';
import {
    DEFAULT_PAGE_LIMIT,
    useFeatureSearch,
} from 'hooks/api/getters/useFeatureSearch/useFeatureSearch';
import mapValues from 'lodash.mapvalues';
import { usePersistentTableState } from 'hooks/usePersistentTableState';
import {
    BooleansStringParam,
    FilterItemParam,
} from 'utils/serializeQueryParams';
import {
    NumberParam,
    StringParam,
    ArrayParam,
    withDefault,
    encodeQueryParams,
} from 'use-query-params';
import { ProjectFeatureTogglesHeader } from './ProjectFeatureTogglesHeader/ProjectFeatureTogglesHeader';
import { createColumnHelper, useReactTable } from '@tanstack/react-table';
import { withTableState } from 'utils/withTableState';
import { type FeatureSearchResponseSchema } from 'openapi';
import { FeatureNameCell } from 'component/common/Table/cells/FeatureNameCell/FeatureNameCell';
import { FeatureToggleCell } from './FeatureToggleCell/FeatureToggleCell';
import { ProjectOverviewFilters } from './ProjectOverviewFilters';
import { useDefaultColumnVisibility } from './hooks/useDefaultColumnVisibility';
import { Placeholder } from './TablePlaceholder/TablePlaceholder';
import { useRowActions } from './hooks/useRowActions';
import { useUiFlag } from 'hooks/useUiFlag';

interface IExperimentalProjectFeatureTogglesProps {
    environments: IProject['environments'];
    refreshInterval?: number;
    storageKey?: string;
}

const formatEnvironmentColumnId = (environment: string) =>
    `environment:${environment}`;

const columnHelper = createColumnHelper<FeatureSearchResponseSchema>();

export const ExperimentalProjectFeatureToggles = ({
    environments,
    refreshInterval = 15 * 1000,
    storageKey = 'project-feature-toggles',
}: IExperimentalProjectFeatureTogglesProps) => {
    const projectId = useRequiredPathParam('projectId');

    const featuresExportImport = useUiFlag('featuresExportImport');

    const stateConfig = {
        offset: withDefault(NumberParam, 0),
        limit: withDefault(NumberParam, DEFAULT_PAGE_LIMIT),
        query: StringParam,
        favoritesFirst: withDefault(BooleansStringParam, true),
        sortBy: withDefault(StringParam, 'createdAt'),
        sortOrder: withDefault(StringParam, 'desc'),
        columns: ArrayParam,
        tag: FilterItemParam,
        createdAt: FilterItemParam,
    };
    const [tableState, setTableState] = usePersistentTableState(
        `${storageKey}-${projectId}`,
        stateConfig,
    );

    const filterState = {
        tag: tableState.tag,
        createdAt: tableState.createdAt,
    };

    const { features, total, refetch, loading, initialLoad } = useFeatureSearch(
        mapValues(
            {
                ...encodeQueryParams(stateConfig, tableState),
                project: `IS:${projectId}`,
            },
            (value) => (value ? `${value}` : undefined),
        ),
        {
            refreshInterval,
        },
    );

    const { favorite, unfavorite } = useFavoriteFeaturesApi();
    const onFavorite = useCallback(
        async (feature: FeatureSearchResponseSchema) => {
            if (feature?.favorite) {
                await unfavorite(projectId, feature.name);
            } else {
                await favorite(projectId, feature.name);
            }
            refetch();
        },
        [projectId, refetch],
    );
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);
    const { onToggle: onFeatureToggle, modals: featureToggleModals } =
        useFeatureToggleSwitch(projectId);
    const {
        rowActionsDialogs,
        setFeatureArchiveState,
        setFeatureStaleDialogState,
    } = useRowActions(refetch, projectId);
    const [showExportDialog, setShowExportDialog] = useState(false);

    const columns = useMemo(
        () => [
            columnHelper.display({
                id: 'select',
                header: ({ table }) => (
                    <MemoizedRowSelectCell
                        noPadding
                        title='Select all rows'
                        checked={table?.getIsAllRowsSelected()}
                        onChange={table?.getToggleAllRowsSelectedHandler()}
                    />
                ),
                cell: ({ row }) => (
                    <MemoizedRowSelectCell
                        noPadding
                        title='Select row'
                        checked={row?.getIsSelected()}
                        onChange={row?.getToggleSelectedHandler()}
                    />
                ),
                meta: {
                    width: '1%',
                },
            }),
            columnHelper.accessor('favorite', {
                id: 'favorite',
                header: () => (
                    <FavoriteIconHeader
                        isActive={tableState.favoritesFirst}
                        onClick={() =>
                            setTableState({
                                favoritesFirst: !tableState.favoritesFirst,
                            })
                        }
                    />
                ),
                cell: ({ row: { original: feature } }) => (
                    <FavoriteIconCell
                        value={feature?.favorite}
                        onClick={() => onFavorite(feature)}
                    />
                ),
                enableSorting: false,
                meta: {
                    align: 'center',
                    width: '1%',
                },
            }),
            columnHelper.accessor('lastSeenAt', {
                id: 'lastSeenAt',
                header: 'Last seen',
                cell: ({ row: { original } }) => (
                    <MemoizedFeatureEnvironmentSeenCell
                        feature={original}
                        data-loading
                    />
                ),
                size: 50,
                meta: {
                    align: 'center',
                    width: '1%',
                },
            }),
            columnHelper.accessor('type', {
                id: 'type',
                header: 'Type',
                cell: FeatureTypeCell,
                meta: {
                    align: 'center',
                    width: '1%',
                },
            }),
            columnHelper.accessor('name', {
                id: 'name',
                header: 'Name',
                cell: FeatureNameCell,
                enableHiding: false,
                meta: {
                    width: '50%',
                },
            }),
            columnHelper.accessor('createdAt', {
                id: 'createdAt',
                header: 'Created',
                cell: DateCell,
            }),
            ...environments.map(
                (projectEnvironment: ProjectEnvironmentType) => {
                    const name = projectEnvironment.environment;
                    const isChangeRequestEnabled =
                        isChangeRequestConfigured(name);

                    return columnHelper.accessor(
                        (row) => ({
                            featureId: row.name,
                            environment: row.environments?.find(
                                (featureEnvironment) =>
                                    featureEnvironment.name === name,
                            ),
                            someEnabledEnvironmentHasVariants:
                                row.environments?.some(
                                    (featureEnvironment) =>
                                        featureEnvironment.variantCount &&
                                        featureEnvironment.variantCount > 0 &&
                                        featureEnvironment.enabled,
                                ) || false,
                        }),
                        {
                            id: formatEnvironmentColumnId(name),
                            header: name,
                            meta: {
                                align: 'center',
                                width: '1%',
                            },
                            cell: ({ getValue }) => {
                                const {
                                    featureId,
                                    environment,
                                    someEnabledEnvironmentHasVariants,
                                } = getValue();

                                return (
                                    <FeatureToggleCell
                                        value={environment?.enabled || false}
                                        featureId={featureId}
                                        someEnabledEnvironmentHasVariants={
                                            someEnabledEnvironmentHasVariants
                                        }
                                        environment={environment}
                                        projectId={projectId}
                                        environmentName={name}
                                        isChangeRequestEnabled={
                                            isChangeRequestEnabled
                                        }
                                        refetch={refetch}
                                        onFeatureToggleSwitch={onFeatureToggle}
                                    />
                                );
                            },
                        },
                    );
                },
            ),
            columnHelper.display({
                id: 'actions',
                header: '',
                cell: ({ row }) => (
                    <ActionsCell
                        row={row}
                        projectId={projectId}
                        onOpenArchiveDialog={setFeatureArchiveState}
                        onOpenStaleDialog={setFeatureStaleDialogState}
                    />
                ),
                enableSorting: false,
                enableHiding: false,
                meta: {
                    align: 'right',
                    width: '1%',
                },
            }),
        ],
        [projectId, environments, tableState.favoritesFirst, refetch],
    );

    const placeholderData = useMemo(
        () =>
            Array(tableState.limit)
                .fill(null)
                .map((_, index) => ({
                    id: index,
                    type: '-',
                    name: `Feature name ${index}`,
                    createdAt: new Date().toISOString(),
                    environments: [
                        {
                            name: 'production',
                            enabled: false,
                        },
                        {
                            name: 'production',
                            enabled: false,
                        },
                    ],
                })),
        [tableState.limit],
    );

    const isPlaceholder = Boolean(initialLoad || (loading && total));
    const bodyLoadingRef = useLoading(isPlaceholder);

    const data = useMemo(() => {
        if (isPlaceholder) {
            return placeholderData;
        }
        return features;
    }, [isPlaceholder, features]);
    const allColumnIds = useMemo(
        () => columns.map((column) => column.id).filter(Boolean) as string[],
        [columns],
    );

    const defaultColumnVisibility = useDefaultColumnVisibility(allColumnIds);

    const table = useReactTable(
        withTableState(tableState, setTableState, {
            columns,
            data,
            enableRowSelection: true,
            state: {
                columnVisibility: defaultColumnVisibility,
            },
        }),
    );

    const { columnVisibility, rowSelection } = table.getState();
    const onToggleColumnVisibility = useCallback(
        (columnId) => {
            const isVisible = columnVisibility[columnId];
            const newColumnVisibility: Record<string, boolean> = {
                ...columnVisibility,
                [columnId]: !isVisible,
            };
            setTableState({
                columns: Object.keys(newColumnVisibility).filter(
                    (columnId) => newColumnVisibility[columnId],
                ),
            });
        },
        [columnVisibility, setTableState],
    );

    return (
        <>
            <PageContent
                disableLoading
                disablePadding
                header={
                    <ProjectFeatureTogglesHeader
                        isLoading={initialLoad}
                        totalItems={total}
                        searchQuery={tableState.query || ''}
                        onChangeSearchQuery={(query) => {
                            setTableState({ query });
                        }}
                        dataToExport={data}
                        environmentsToExport={environments.map(
                            ({ environment }) => environment,
                        )}
                        actions={
                            <ColumnsMenu
                                columns={[
                                    {
                                        header: 'Last seen',
                                        id: 'lastSeenAt',
                                        isVisible: columnVisibility.lastSeenAt,
                                    },
                                    {
                                        header: 'Type',
                                        id: 'type',
                                        isVisible: columnVisibility.type,
                                    },
                                    {
                                        header: 'Name',
                                        id: 'name',
                                        isVisible: columnVisibility.name,
                                        isStatic: true,
                                    },
                                    {
                                        header: 'Created',
                                        id: 'createdAt',
                                        isVisible: columnVisibility.createdAt,
                                    },
                                    {
                                        id: 'divider',
                                    },
                                    ...environments.map(({ environment }) => ({
                                        header: environment,
                                        id: formatEnvironmentColumnId(
                                            environment,
                                        ),
                                        isVisible:
                                            columnVisibility[
                                                formatEnvironmentColumnId(
                                                    environment,
                                                )
                                            ],
                                    })),
                                ]}
                                onToggle={onToggleColumnVisibility}
                            />
                        }
                    />
                }
            >
                <div
                    ref={bodyLoadingRef}
                    aria-busy={isPlaceholder}
                    aria-live='polite'
                >
                    <ProjectOverviewFilters
                        onChange={setTableState}
                        state={filterState}
                    />
                    <SearchHighlightProvider value={tableState.query || ''}>
                        <PaginatedTable
                            tableInstance={table}
                            totalItems={total}
                        />
                    </SearchHighlightProvider>
                    <Placeholder total={total} query={tableState.query || ''} />
                    {rowActionsDialogs}

                    <ConditionallyRender
                        condition={featuresExportImport && !loading}
                        show={
                            // FIXME: export only selected rows?
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
            <BatchSelectionActionsBar count={Object.keys(rowSelection).length}>
                <ProjectFeaturesBatchActions
                    selectedIds={Object.keys(rowSelection)}
                    data={features}
                    projectId={projectId}
                    onResetSelection={table.resetRowSelection}
                />
            </BatchSelectionActionsBar>
        </>
    );
};
