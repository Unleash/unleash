import { useCallback, useMemo, useState } from 'react';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { PageContent } from 'component/common/PageContent/PageContent';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { DateCell } from 'component/common/Table/cells/DateCell/DateCell';
import { PaginatedTable } from 'component/common/Table';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { FavoriteIconHeader } from 'component/common/Table/FavoriteIconHeader/FavoriteIconHeader';
import { FavoriteIconCell } from 'component/common/Table/cells/FavoriteIconCell/FavoriteIconCell';
import { ActionsCell } from '../ProjectFeatureToggles/ActionsCell/ActionsCell.tsx';
import { useFavoriteFeaturesApi } from 'hooks/api/actions/useFavoriteFeaturesApi/useFavoriteFeaturesApi';
import { MemoizedRowSelectCell } from '../ProjectFeatureToggles/RowSelectCell/RowSelectCell.tsx';
import { BatchSelectionActionsBar } from 'component/common/BatchSelectionActionsBar/BatchSelectionActionsBar';
import { ProjectFeaturesBatchActions } from '../ProjectFeatureToggles/ProjectFeaturesBatchActions/ProjectFeaturesBatchActions.tsx';
import {
    FeatureLifecycleCell,
    MemoizedFeatureEnvironmentSeenCell,
} from 'component/common/Table/cells/FeatureSeenCell/FeatureEnvironmentSeenCell';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { useFeatureToggleSwitch } from '../ProjectFeatureToggles/FeatureToggleSwitch/useFeatureToggleSwitch.tsx';
import useLoading from 'hooks/useLoading';
import { createColumnHelper, useReactTable } from '@tanstack/react-table';
import { withTableState } from 'utils/withTableState';
import type { FeatureSearchResponseSchema } from 'openapi';
import {
    ArchivedFeatureToggleCell,
    FeatureToggleCell,
    PlaceholderFeatureToggleCell,
} from './FeatureToggleCell/FeatureToggleCell.tsx';
import { ProjectOverviewFilters } from './ProjectOverviewFilters.tsx';
import { ProjectLifecycleFilters } from './ProjectLifecycleFilters.tsx';
import { useDefaultColumnVisibility } from './hooks/useDefaultColumnVisibility.ts';
import { TableEmptyState } from './TableEmptyState/TableEmptyState.tsx';
import { useRowActions } from './hooks/useRowActions.tsx';
import { useSelectedData } from './hooks/useSelectedData.ts';
import { createFeatureOverviewCell } from 'component/common/Table/cells/FeatureOverviewCell/FeatureOverviewCell';
import {
    useProjectFeatureSearch,
    useProjectFeatureSearchActions,
} from './useProjectFeatureSearch.ts';
import { AvatarCell } from './AvatarCell.tsx';
import { Box, styled, useMediaQuery, useTheme } from '@mui/material';
import useProjectOverview from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import { ConnectSdkDialog } from '../../../onboarding/dialog/ConnectSdkDialog.tsx';
import { ProjectOnboarding } from '../../../onboarding/flow/ProjectOnboarding.tsx';
import { useLocalStorageState } from 'hooks/useLocalStorageState';
import { ProjectOnboarded } from 'component/onboarding/flow/ProjectOnboarded';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { ArchivedFeatureActionCell } from '../../../archive/ArchiveTable/ArchivedFeatureActionCell/ArchivedFeatureActionCell.tsx';
import { ArchiveBatchActions } from '../../../archive/ArchiveTable/ArchiveBatchActions.tsx';
import { ImportModal } from '../Import/ImportModal.tsx';
import { ProjectCleanupReminder } from './ProjectCleanupReminder/ProjectCleanupReminder.tsx';
import { formatEnvironmentColumnId } from './formatEnvironmentColumnId.ts';
import { ProjectFeaturesColumnsMenu } from './ProjectFeaturesColumnsMenu/ProjectFeaturesColumnsMenu.tsx';
import { ProjectFeatureTogglesHeader } from './ProjectFeatureTogglesHeader/ProjectFeatureTogglesHeader.tsx';
import { ProjectFlagsSearch } from './ProjectFlagsSearch/ProjectFlagsSearch.tsx';

type ProjectFeatureTogglesProps = {
    environments: string[];
};

const columnHelper = createColumnHelper<FeatureSearchResponseSchema>();
const getRowId = (row: { name: string }) => row.name;

const Container = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

const FiltersContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    padding: theme.spacing(2, 3, 2),
    [theme.breakpoints.down('md')]: {
        padding: theme.spacing(2, 2),
    },
}));

const FilterRow = styled('div')({
    display: 'flex',
    alignItems: 'center',
});

const LinkToggle = styled('button')(({ theme }) => ({
    background: 'none',
    border: 'none',
    padding: 0,
    margin: theme.spacing(0, 1.5),
    marginLeft: 'auto',
    cursor: 'pointer',
    color: theme.palette.primary.main,
    textDecoration: 'underline',
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.fontWeightMedium,
    display: 'inline-flex',
    alignItems: 'center',
    '&:hover': {
        textDecoration: 'none',
    },
}));

export const ProjectFeatureToggles = ({
    environments: availableEnvironments,
}: ProjectFeatureTogglesProps) => {
    const { trackEvent } = usePlausibleTracker();
    const projectId = useRequiredPathParam('projectId');
    const { project } = useProjectOverview(projectId);
    const [connectSdkOpen, setConnectSdkOpen] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const theme = useTheme();
    const isSmallerScreen = useMediaQuery(theme.breakpoints.down('xl'));

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
        archived: tableState.archived,
        lifecycle: tableState.lifecycle,
        lastSeenAt: tableState.lastSeenAt,
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

    // TODO: remove tracking after `filterFlagsToArchive` flag
    const trackArchiveAction = (eventType = 'archived flag') => {
        trackEvent('project-cleanup', {
            props: { eventType, showCleanupReminder },
        });
    };
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);
    const { onToggle: onFeatureToggle, modals: featureToggleModals } =
        useFeatureToggleSwitch(projectId);
    const {
        rowActionsDialogs,
        setFeatureArchiveState,
        setFeatureStaleDialogState,
        setShowMarkCompletedDialogue,
        setShowFeatureReviveDialogue,
        setShowFeatureDeleteDialogue,
    } = useRowActions(refetch, projectId, trackArchiveAction);

    const isPlaceholder = Boolean(initialLoad || loading);

    const [onboardingFlow, setOnboardingFlow] = useLocalStorageState<
        'visible' | 'closed'
    >(`onboarding-flow:v1-${projectId}`, 'visible');
    const [setupCompletedState, setSetupCompletedState] = useLocalStorageState<
        'hide-setup' | 'show-setup'
    >(`onboarding-state:v1-${projectId}`, 'hide-setup');

    const isOnboarding =
        project.onboardingStatus.status !== 'onboarded' &&
        onboardingFlow === 'visible';

    const trackOnboardingFinish = (sdkName: string) => {
        if (!isOnboarding) {
            trackEvent('onboarding', {
                props: {
                    eventType: 'onboarding-finished',
                    onboardedSdk: sdkName,
                },
            });
        }
    };

    const showCleanupReminder = !tableState.lastSeenAt && !tableState.lifecycle;
    const showArchived = Boolean(tableState.archived);
    const toggleArchived = () => {
        if (showArchived) {
            setTableState({ archived: undefined });
        } else {
            setTableState({
                archived: { operator: 'IS', values: ['true'] },
                lifecycle: undefined,
            });
        }
    };
    const environments = showArchived ? [] : availableEnvironments;

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
                    width: '1%',
                },
            }),
            columnHelper.accessor('name', {
                id: 'name',
                header: 'Name',
                cell: createFeatureOverviewCell(onTagClick, onFlagTypeClick),
                enableHiding: false,
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
                        archived: row.archivedAt !== null,
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
                                archived,
                            } = getValue();

                            return isPlaceholder ? (
                                <PlaceholderFeatureToggleCell />
                            ) : archived ? (
                                <ArchivedFeatureToggleCell />
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
                cell: ({ row }) =>
                    tableState.archived ? (
                        <ArchivedFeatureActionCell
                            project={projectId}
                            onRevive={() => {
                                setShowFeatureReviveDialogue({
                                    featureId: row.id,
                                    open: true,
                                });
                            }}
                            onDelete={() => {
                                setShowFeatureDeleteDialogue({
                                    featureId: row.id,
                                    open: true,
                                });
                            }}
                        />
                    ) : (
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
                    archivedAt: null,
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
        <Container>
            <ConditionallyRender
                condition={isOnboarding}
                show={
                    <ProjectOnboarding
                        projectId={projectId}
                        setConnectSdkOpen={setConnectSdkOpen}
                        setOnboardingFlow={setOnboardingFlow}
                        refetchFeatures={refetch}
                    />
                }
            />
            {setupCompletedState === 'show-setup' && !isOnboarding ? (
                <ProjectOnboarded
                    projectId={projectId}
                    onClose={() => {
                        setSetupCompletedState('hide-setup');
                    }}
                />
            ) : null}
            {showCleanupReminder ? (
                <ProjectCleanupReminder projectId={projectId} />
            ) : null}
            <PageContent
                disableLoading
                header={
                    <ProjectFeatureTogglesHeader
                        isLoading={initialLoad}
                        totalItems={total}
                        environmentsToExport={environments}
                        actions={
                            <LinkToggle type='button' onClick={toggleArchived}>
                                {showArchived
                                    ? 'View active flags'
                                    : 'View archived flags'}
                            </LinkToggle>
                        }
                        title={
                            showArchived
                                ? 'Archived feature flags'
                                : 'Feature flags'
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
                    <FiltersContainer>
                        <FilterRow>
                            {showArchived ? (
                                <Box sx={{ marginRight: 'auto' }}>
                                    <ProjectOverviewFilters
                                        project={projectId}
                                        onChange={setTableState}
                                        state={filterState}
                                    />
                                </Box>
                            ) : (
                                <ProjectLifecycleFilters
                                    projectId={projectId}
                                    state={filterState}
                                    onChange={setTableState}
                                    total={loading ? undefined : total}
                                />
                            )}
                            {isSmallerScreen && !showArchived ? null : (
                                <ProjectFlagsSearch
                                    searchQuery={tableState.query || ''}
                                    onChangeSearchQuery={(query) => {
                                        setTableState({ query });
                                    }}
                                    isLoading={loading}
                                />
                            )}
                            <ProjectFeaturesColumnsMenu
                                columnVisibility={columnVisibility}
                                environments={environments}
                                onToggle={onToggleColumnVisibility}
                            />
                        </FilterRow>
                        {showArchived ? null : (
                            <FilterRow>
                                <ProjectOverviewFilters
                                    project={projectId}
                                    onChange={setTableState}
                                    state={filterState}
                                />
                            </FilterRow>
                        )}
                        {isSmallerScreen && !showArchived ? (
                            <ProjectFlagsSearch
                                searchQuery={tableState.query || ''}
                                onChangeSearchQuery={(query) => {
                                    setTableState({ query });
                                }}
                                isLoading={loading}
                            />
                        ) : null}
                    </FiltersContainer>
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
            <ConnectSdkDialog
                open={connectSdkOpen}
                onClose={() => {
                    setConnectSdkOpen(false);
                }}
                onFinish={(sdkName: string) => {
                    setConnectSdkOpen(false);
                    setSetupCompletedState('show-setup');
                    trackOnboardingFinish(sdkName);
                }}
                project={projectId}
                environments={environments}
                feature={
                    'feature' in project.onboardingStatus
                        ? project.onboardingStatus.feature
                        : undefined
                }
            />
            <BatchSelectionActionsBar count={selectedData.length}>
                {tableState.archived ? (
                    <ArchiveBatchActions
                        selectedIds={Object.keys(rowSelection)}
                        projectId={projectId}
                        onConfirm={() => {
                            refetch();
                            table.resetRowSelection();
                            trackArchiveAction('bulk archived');
                        }}
                    />
                ) : (
                    <ProjectFeaturesBatchActions
                        selectedIds={Object.keys(rowSelection)}
                        data={selectedData}
                        projectId={projectId}
                        onResetSelection={table.resetRowSelection}
                        onChange={refetch}
                    />
                )}
            </BatchSelectionActionsBar>
            <ImportModal
                open={modalOpen}
                setOpen={setModalOpen}
                project={projectId}
            />
        </Container>
    );
};
