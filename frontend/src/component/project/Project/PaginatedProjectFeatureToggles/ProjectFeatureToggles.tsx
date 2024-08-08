import { useCallback, useMemo } from 'react';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { PageContent } from 'component/common/PageContent/PageContent';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { DateCell } from 'component/common/Table/cells/DateCell/DateCell';
import { PaginatedTable } from 'component/common/Table';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { FavoriteIconHeader } from 'component/common/Table/FavoriteIconHeader/FavoriteIconHeader';
import { FavoriteIconCell } from 'component/common/Table/cells/FavoriteIconCell/FavoriteIconCell';
import { ActionsCell } from '../ProjectFeatureToggles/ActionsCell/ActionsCell';
import { ExperimentalColumnsMenu as ColumnsMenu } from './ExperimentalColumnsMenu/ExperimentalColumnsMenu';
import { useFavoriteFeaturesApi } from 'hooks/api/actions/useFavoriteFeaturesApi/useFavoriteFeaturesApi';
import { MemoizedRowSelectCell } from '../ProjectFeatureToggles/RowSelectCell/RowSelectCell';
import { BatchSelectionActionsBar } from 'component/common/BatchSelectionActionsBar/BatchSelectionActionsBar';
import { ProjectFeaturesBatchActions } from '../ProjectFeatureToggles/ProjectFeaturesBatchActions/ProjectFeaturesBatchActions';
import {
    FeatureLifecycleCell,
    MemoizedFeatureEnvironmentSeenCell,
} from 'component/common/Table/cells/FeatureSeenCell/FeatureEnvironmentSeenCell';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { useFeatureToggleSwitch } from '../ProjectFeatureToggles/FeatureToggleSwitch/useFeatureToggleSwitch';
import useLoading from 'hooks/useLoading';
import { ProjectFeatureTogglesHeader } from './ProjectFeatureTogglesHeader/ProjectFeatureTogglesHeader';
import { createColumnHelper, useReactTable } from '@tanstack/react-table';
import { withTableState } from 'utils/withTableState';
import type { FeatureSearchResponseSchema } from 'openapi';
import {
    FeatureToggleCell,
    PlaceholderFeatureToggleCell,
} from './FeatureToggleCell/FeatureToggleCell';
import { ProjectOverviewFilters } from './ProjectOverviewFilters';
import { useDefaultColumnVisibility } from './hooks/useDefaultColumnVisibility';
import { TableEmptyState } from './TableEmptyState/TableEmptyState';
import { useRowActions } from './hooks/useRowActions';
import { useSelectedData } from './hooks/useSelectedData';
import { FeatureOverviewCell } from '../../../common/Table/cells/FeatureOverviewCell/FeatureOverviewCell';
import {
    useProjectFeatureSearch,
    useProjectFeatureSearchActions,
} from './useProjectFeatureSearch';
import { AvatarCell } from './AvatarCell';

interface IPaginatedProjectFeatureTogglesProps {
    environments: string[];
}

const formatEnvironmentColumnId = (environment: string) =>
    `environment:${environment}`;

const columnHelper = createColumnHelper<FeatureSearchResponseSchema>();
const getRowId = (row: { name: string }) => row.name;

export const ProjectFeatureToggles = ({
    environments,
}: IPaginatedProjectFeatureTogglesProps) => {
    const projectId = useRequiredPathParam('projectId');

    const {
        features,
        total,
        refetch,
        loading,
        initialLoad,
        tableState,
        setTableState,
    } = useProjectFeatureSearch(projectId);

    const { onFlagTypeClick, onTagClick, onAvatarClick } =
        useProjectFeatureSearchActions(tableState, setTableState);

    const filterState = {
        tag: tableState.tag,
        createdAt: tableState.createdAt,
        type: tableState.type,
        state: tableState.state,
        createdBy: tableState.createdBy,
    };

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
        setShowMarkCompletedDialogue,
    } = useRowActions(refetch, projectId);

    const isPlaceholder = Boolean(initialLoad || (loading && total));

    const columns = useMemo(
        () => [
            columnHelper.display({
                id: 'select',
                header: ({ table }) => (
                    <MemoizedRowSelectCell
                        title='Select all rows'
                        checked={table?.getIsAllRowsSelected()}
                        onChange={table?.getToggleAllRowsSelectedHandler()}
                    />
                ),
                cell: ({ row }) => (
                    <MemoizedRowSelectCell
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
            columnHelper.accessor('name', {
                id: 'name',
                header: 'Name',
                cell: FeatureOverviewCell(onTagClick, onFlagTypeClick),
                enableHiding: false,
                meta: {
                    width: '50%',
                },
            }),
            columnHelper.accessor('createdAt', {
                id: 'createdAt',
                header: 'Created',
                cell: DateCell,
                meta: {
                    width: '1%',
                },
            }),
            columnHelper.accessor('createdBy', {
                id: 'createdBy',
                header: 'By',
                cell: AvatarCell(onAvatarClick),
                enableSorting: false,
                meta: {
                    width: '1%',
                    align: 'center',
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
            columnHelper.accessor('lifecycle', {
                id: 'lifecycle',
                header: 'Lifecycle',
                cell: ({ row: { original } }) => (
                    <FeatureLifecycleCell
                        feature={original}
                        onComplete={() => {
                            setShowMarkCompletedDialogue({
                                featureId: original.name,
                                open: true,
                            });
                        }}
                        onUncomplete={refetch}
                        onArchive={() => setFeatureArchiveState(original.name)}
                        data-loading
                    />
                ),
                enableSorting: false,
                size: 50,
                meta: {
                    align: 'center',
                    width: '1%',
                },
            }),
            ...environments.map((name: string) => {
                const isChangeRequestEnabled = isChangeRequestConfigured(name);

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

                            return isPlaceholder ? (
                                <PlaceholderFeatureToggleCell />
                            ) : (
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
            }),
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
        [
            projectId,
            environments,
            tableState.favoritesFirst,
            refetch,
            isPlaceholder,
        ],
    );

    const placeholderData = useMemo(
        () =>
            Array(tableState.limit)
                .fill(null)
                .map((_, index) => ({
                    id: index,
                    type: '-',
                    name: `Feature name ${index}`,
                    description: '',
                    createdAt: new Date().toISOString(),
                    createdBy: {
                        id: 0,
                        name: '',
                        imageUrl: '',
                    },
                    dependencyType: null,
                    favorite: false,
                    impressionData: false,
                    project: 'project',
                    segments: [],
                    stale: false,
                    environments: [
                        {
                            name: 'development',
                            enabled: false,
                            type: 'development',
                        },
                        {
                            name: 'production',
                            enabled: false,
                            type: 'production',
                        },
                    ],
                })),
        [tableState.limit],
    );

    const bodyLoadingRef = useLoading(isPlaceholder);

    const data = useMemo(() => {
        if (isPlaceholder) {
            return placeholderData;
        }
        return features;
    }, [isPlaceholder, JSON.stringify(features)]);
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
        (columnId: string) => {
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
                        environmentsToExport={environments}
                        actions={
                            <ColumnsMenu
                                columns={[
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
                                        header: 'By',
                                        id: 'createdBy',
                                        isVisible: columnVisibility.createdBy,
                                    },
                                    {
                                        header: 'Last seen',
                                        id: 'lastSeenAt',
                                        isVisible: columnVisibility.lastSeenAt,
                                    },
                                    {
                                        header: 'Lifecycle',
                                        id: 'lifecycle',
                                        isVisible: columnVisibility.lifecycle,
                                    },
                                    {
                                        id: 'divider',
                                    },
                                    ...environments.map((environment) => ({
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
                        project={projectId}
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
