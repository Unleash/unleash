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
import {
    PaginatedTable,
    TablePlaceholder,
    VirtualizedTable,
} from 'component/common/Table';
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
import { ColumnsMenu } from '../../ProjectFeatureToggles/ColumnsMenu/ColumnsMenu';
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
import { BooleansStringParam } from 'utils/serializeQueryParams';
import {
    NumberParam,
    StringParam,
    ArrayParam,
    withDefault,
} from 'use-query-params';
import { ProjectFeatureTogglesHeader } from './ProjectFeatureTogglesHeader/ProjectFeatureTogglesHeader';
import { createColumnHelper, useReactTable } from '@tanstack/react-table';
import { withTableState } from 'utils/withTableState';
import { type FeatureSearchResponseSchema } from 'openapi';
import { FeatureNameCell } from 'component/common/Table/cells/FeatureNameCell/FeatureNameCell';
import { FeatureToggleCell } from './FeatureToggleCell/FeatureToggleCell';

interface IExperimentalProjectFeatureTogglesProps {
    environments: IProject['environments'];
    style?: CSSProperties;
    refreshInterval?: number;
    storageKey?: string;
}

const staticColumns = ['Select', 'Actions', 'name', 'favorite'];

const columnHelper = createColumnHelper<FeatureSearchResponseSchema>();

export const ExperimentalProjectFeatureToggles = ({
    environments,
    style,
    refreshInterval = 15 * 1000,
    storageKey = 'project-feature-toggles',
}: IExperimentalProjectFeatureTogglesProps) => {
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
        mapValues({ ...tableState, projectId }, (value) =>
            value ? `${value}` : undefined,
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
    const bodyLoadingRef = useLoading(loading);
    const columns = useMemo(
        () => [
            columnHelper.display({
                id: 'Select',
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
            }),
            columnHelper.accessor('favorite', {
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
                    // hideInMenu: true,
                },
            }),
            columnHelper.accessor('lastSeenAt', {
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
                },
            }),
            columnHelper.accessor('type', {
                header: 'Type',
                cell: FeatureTypeCell,
                meta: {
                    align: 'center',
                },
            }),
            columnHelper.accessor('name', {
                header: 'Name',
                cell: FeatureNameCell,
                meta: {
                    width: '50%',
                },
            }),
            columnHelper.accessor('createdAt', {
                header: 'Created',
                cell: DateCell,
            }),
            ...environments.map(
                (projectEnvironment: ProjectEnvironmentType) => {
                    const name = projectEnvironment.environment;
                    const isChangeRequestEnabled =
                        isChangeRequestConfigured(name);

                    return columnHelper.accessor(
                        (row) =>
                            [
                                row.name,
                                row.environments?.find(
                                    (featureEnvironment) =>
                                        featureEnvironment.name === name,
                                ),
                                row.environments?.some(
                                    (featureEnvironment) =>
                                        featureEnvironment.variantCount &&
                                        featureEnvironment.variantCount > 0 &&
                                        featureEnvironment.enabled,
                                ) || false,
                            ] as const,
                        {
                            id: `environment:${name}`,
                            header: loading ? '' : name,
                            meta: {
                                align: 'center',
                            },
                            cell: ({ getValue }) => {
                                const [
                                    featureId,
                                    environment,
                                    someEnabledEnvironmentHasVariants,
                                ] = getValue();

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
        ],
        [projectId, environments, loading, tableState.favoritesFirst, refetch],
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

    const data = useMemo(() => {
        if (initialLoad || (loading && total)) {
            return placeholderData;
        }
        return features;
    }, [loading, features]);

    const table = useReactTable(
        withTableState(tableState, setTableState, {
            columns,
            data,
            enableRowSelection: true,
        }),
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
                    />
                }
            >
                <div
                    ref={bodyLoadingRef}
                    aria-busy={loading}
                    aria-live='polite'
                >
                    <SearchHighlightProvider value={tableState.query || ''}>
                        <PaginatedTable
                            tableInstance={table}
                            totalItems={total}
                        />
                    </SearchHighlightProvider>
                    {/*
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
                    {featureToggleModals} */}
                </div>
            </PageContent>
            {/* <BatchSelectionActionsBar
                count={Object.keys(selectedRowIds).length}
            >
                <ProjectFeaturesBatchActions
                    selectedIds={Object.keys(selectedRowIds)}
                    data={features}
                    projectId={projectId}
                    onResetSelection={() => toggleAllRowsSelected(false)}
                />
            </BatchSelectionActionsBar> */}
        </>
    );
};
