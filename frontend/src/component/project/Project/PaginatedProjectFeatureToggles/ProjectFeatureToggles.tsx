import { useCallback, useMemo, useState } from 'react';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { PageContent } from 'component/common/PageContent/PageContent';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { DateCell } from 'component/common/Table/cells/DateCell/DateCell';
import { FeatureTypeCell } from 'component/common/Table/cells/FeatureTypeCell/FeatureTypeCell';
import { IProject } from 'interfaces/project';
import { PaginatedTable } from 'component/common/Table';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { FavoriteIconHeader } from 'component/common/Table/FavoriteIconHeader/FavoriteIconHeader';
import { FavoriteIconCell } from 'component/common/Table/cells/FavoriteIconCell/FavoriteIconCell';
import { ProjectEnvironmentType } from '../ProjectFeatureToggles/hooks/useEnvironmentsRef';
import { ActionsCell } from '../ProjectFeatureToggles/ActionsCell/ActionsCell';
import { ExperimentalColumnsMenu as ColumnsMenu } from './ExperimentalColumnsMenu/ExperimentalColumnsMenu';
import { useFavoriteFeaturesApi } from 'hooks/api/actions/useFavoriteFeaturesApi/useFavoriteFeaturesApi';
import { ExportDialog } from 'component/feature/FeatureToggleList/ExportDialog';
import { MemoizedRowSelectCell } from '../ProjectFeatureToggles/RowSelectCell/RowSelectCell';
import { BatchSelectionActionsBar } from 'component/common/BatchSelectionActionsBar/BatchSelectionActionsBar';
import { ProjectFeaturesBatchActions } from '../ProjectFeatureToggles/ProjectFeaturesBatchActions/ProjectFeaturesBatchActions';
import { MemoizedFeatureEnvironmentSeenCell } from 'component/common/Table/cells/FeatureSeenCell/FeatureEnvironmentSeenCell';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { useFeatureToggleSwitch } from '../ProjectFeatureToggles/FeatureToggleSwitch/useFeatureToggleSwitch';
import useLoading from 'hooks/useLoading';
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
import { TableEmptyState } from './TableEmptyState/TableEmptyState';
import { useRowActions } from './hooks/useRowActions';
import { useUiFlag } from 'hooks/useUiFlag';
import { FeatureTagCell } from 'component/common/Table/cells/FeatureTagCell/FeatureTagCell';
import { useSelectedData } from './hooks/useSelectedData';

interface IPaginatedProjectFeatureTogglesProps {
    environments: IProject['environments'];
    refreshInterval?: number;
    storageKey?: string;
}

const formatEnvironmentColumnId = (environment: string) =>
    `environment:${environment}`;

const columnHelper = createColumnHelper<FeatureSearchResponseSchema>();
const getRowId = (row: { name: string }) => row.name;

export const ProjectFeatureToggles = ({
    environments,
    refreshInterval = 15 * 1000,
    storageKey = 'project-feature-toggles-v2',
}: IPaginatedProjectFeatureTogglesProps) => {
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
                enableHiding: false,
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
                enableHiding: false,
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
            columnHelper.accessor('tags', {
                id: 'tags',
                header: 'Tags',
                enableSorting: false,
                cell: FeatureTagCell,
                meta: {
                    width: '1%',
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
                                width: 90,
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
            getRowId,
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
                    (columnId) =>
                        newColumnVisibility[columnId] &&
                        !columnId.includes(','),
                ),
            });
        },
        [columnVisibility, setTableState],
    );

    const selectedData = useSelectedData(features, rowSelection);

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
                                        header: 'Tags',
                                        id: 'tags',
                                        isVisible: columnVisibility.tags,
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
                bodyClass='noop'
                style={{ cursor: 'inherit' }}
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
                    <ConditionallyRender
                        condition={!data.length && !isPlaceholder}
                        show={
                            <TableEmptyState query={tableState.query || ''} />
                        }
                    />
                    {rowActionsDialogs}

                    <ConditionallyRender
                        condition={featuresExportImport && !loading}
                        show={
                            // TODO: `export all` backend
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
            <BatchSelectionActionsBar count={selectedData.length}>
                <ProjectFeaturesBatchActions
                    selectedIds={Object.keys(rowSelection)}
                    data={selectedData}
                    projectId={projectId}
                    onResetSelection={table.resetRowSelection}
                    onChange={refetch}
                />
            </BatchSelectionActionsBar>
        </>
    );
};
