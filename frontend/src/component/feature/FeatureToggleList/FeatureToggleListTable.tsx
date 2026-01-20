import { useCallback, useEffect, useMemo, useState, type FC } from 'react';
import { Box, Link, useMediaQuery, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { createColumnHelper, useReactTable } from '@tanstack/react-table';
import { PaginatedTable, TablePlaceholder } from 'component/common/Table';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { DateCell } from 'component/common/Table/cells/DateCell/DateCell';
import { LinkCell } from 'component/common/Table/cells/LinkCell/LinkCell';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import type { FeatureSchema, FeatureSearchResponseSchema } from 'openapi';
import { Search } from 'component/common/Search/Search';
import { useFavoriteFeaturesApi } from 'hooks/api/actions/useFavoriteFeaturesApi/useFavoriteFeaturesApi';
import { FavoriteIconCell } from 'component/common/Table/cells/FavoriteIconCell/FavoriteIconCell';
import { FavoriteIconHeader } from 'component/common/Table/FavoriteIconHeader/FavoriteIconHeader';
import { useEnvironments } from 'hooks/api/getters/useEnvironments/useEnvironments';
import { ExportDialog } from './ExportDialog.tsx';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { focusable } from 'themes/themeStyles';
import { FeatureLifecycleCell } from 'component/common/Table/cells/FeatureSeenCell/FeatureEnvironmentSeenCell';
import useToast from 'hooks/useToast';
import { FeaturesOverviewToggleFilters } from './FeaturesOverviewLifecycleFilters/FeaturesOverviewToggleFilters.tsx';
import { withTableState } from 'utils/withTableState';
import useLoading from 'hooks/useLoading';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import {
    useGlobalFeatureSearch,
    useTableStateFilter,
} from './useGlobalFeatureSearch.ts';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { FeaturesOverviewLifecycleFilters } from './FeaturesOverviewLifecycleFilters/FeaturesOverviewLifecycleFilters.tsx';
import { ExportFlags } from './ExportFlags.tsx';
import { createFeatureOverviewCell } from 'component/common/Table/cells/FeatureOverviewCell/FeatureOverviewCell';
import { AvatarCell } from 'component/project/Project/PaginatedProjectFeatureToggles/AvatarCell';
import { StatusCell } from './StatusCell/StatusCell.tsx';

export const featuresPlaceholder = Array(15).fill({
    name: 'Name of the feature',
    description: 'Short description of the feature',
    type: '-',
    createdAt: new Date(2022, 1, 1).toISOString(),
    project: 'projectID',
    createdBy: {
        id: 0,
        name: 'admin',
        imageUrl: '',
    },
    archivedAt: null,
    favorite: false,
    stale: false,
    dependencyType: null,
    tags: [],
    environments: [],
    impressionData: false,
    segments: [],
} as FeatureSearchResponseSchema);

const columnHelper = createColumnHelper<FeatureSearchResponseSchema>();

export const FeatureToggleListTable: FC = () => {
    const theme = useTheme();
    const { isOss } = useUiConfig();
    const { trackEvent } = usePlausibleTracker();
    const { environments } = useEnvironments();
    const enabledEnvironments = environments
        .filter((env) => env.enabled)
        .map((env) => env.name);
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const isMediumScreen = useMediaQuery(theme.breakpoints.down('lg'));
    const isLargeScreen = useMediaQuery(theme.breakpoints.down('xl'));
    const [showExportDialog, setShowExportDialog] = useState(false);

    const { setToastApiError } = useToast();

    const {
        features,
        total,
        refetch: refetchFeatures,
        loading,
        initialLoad,
        tableState,
        setTableState,
        filterState,
    } = useGlobalFeatureSearch();
    const onFlagTypeClick = useTableStateFilter(
        ['type', 'IS'],
        tableState,
        setTableState,
    );
    const onTagClick = useTableStateFilter(
        ['tag', 'INCLUDE'],
        tableState,
        setTableState,
    );

    const { projects } = useProjects();
    const bodyLoadingRef = useLoading(loading);
    const { favorite, unfavorite } = useFavoriteFeaturesApi();
    const onFavorite = useCallback(
        async (feature: FeatureSchema) => {
            try {
                if (feature?.favorite) {
                    await unfavorite(feature.project!, feature.name);
                } else {
                    await favorite(feature.project!, feature.name);
                }
                refetchFeatures();
            } catch (_error) {
                setToastApiError(
                    'Something went wrong, could not update favorite',
                );
            }
        },
        [favorite, refetchFeatures, unfavorite, setToastApiError],
    );

    const showStatusColumn = !isOss();

    const columns = useMemo(
        () => [
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
                cell: ({ getValue, row }) => (
                    <FavoriteIconCell
                        value={getValue()}
                        onClick={() => onFavorite(row.original)}
                    />
                ),
                enableSorting: false,
                meta: { width: 48 },
            }),
            columnHelper.accessor('name', {
                header: 'Name',
                cell: createFeatureOverviewCell(onTagClick, onFlagTypeClick),
                meta: { width: '40%' },
            }),
            columnHelper.accessor('createdAt', {
                header: 'Created',
                cell: ({ getValue }) => <DateCell value={getValue()} />,
                meta: { width: '1%' },
            }),
            columnHelper.accessor('createdBy', {
                id: 'createdBy',
                header: 'By',
                cell: AvatarCell(),
                meta: { width: '1%', align: 'center' },
                enableSorting: false,
            }),
            columnHelper.accessor('lifecycle', {
                id: 'lifecycle',
                header: 'Lifecycle',
                cell: ({ row: { original } }) => (
                    <FeatureLifecycleCell
                        feature={original}
                        expanded
                        data-loading
                    />
                ),
                enableSorting: false,
                size: 50,
                meta: { width: '1%' },
            }),
            ...(showStatusColumn
                ? [
                      columnHelper.accessor('environments', {
                          id: 'status',
                          header: 'Status',
                          cell: ({ row: { original } }) => (
                              <StatusCell {...original} />
                          ),
                          enableSorting: false,
                          size: 350,
                      }),
                  ]
                : []),
            columnHelper.accessor('project', {
                header: 'Project',
                cell: ({ getValue }) => {
                    const projectId = getValue();
                    const projectName = projects.find(
                        (project) => project.id === projectId,
                    )?.name;

                    return (
                        <Box sx={{ minWidth: '180px' }}>
                            <LinkCell
                                title={projectName || projectId}
                                to={`/projects/${projectId}`}
                            />
                        </Box>
                    );
                },
            }),
        ],
        [tableState.favoritesFirst, showStatusColumn],
    );
    const data = useMemo<FeatureSearchResponseSchema[]>(
        () =>
            features?.length === 0 && loading ? featuresPlaceholder : features,
        [initialLoad, features, loading],
    );
    const table = useReactTable(
        withTableState(tableState, setTableState, {
            columns,
            data,
        }),
    );

    useEffect(() => {
        if (isSmallScreen) {
            table.setColumnVisibility({
                type: false,
                createdAt: false,
                tags: false,
                lastSeenAt: false,
                stale: false,
            });
        } else if (isMediumScreen) {
            table.setColumnVisibility({
                lastSeenAt: false,
                stale: false,
            });
        } else {
            table.setColumnVisibility({});
        }
    }, [isSmallScreen, isMediumScreen]);

    const setSearchValue = (query = '') => {
        setTableState({ query });
        trackEvent('search-bar', {
            props: {
                screen: 'features',
                length: query.length,
            },
        });
    };

    const rows = table.getRowModel().rows;

    if (!(environments.length > 0)) {
        return null;
    }

    return (
        <PageContent
            disableLoading={true}
            bodyClass='no-padding'
            header={
                <PageHeader
                    title='Flags overview'
                    actions={
                        <>
                            <Link
                                component={RouterLink}
                                to='/unknown-flags'
                                underline='always'
                                sx={{
                                    marginRight: 2,
                                    fontSize: theme.typography.body2.fontSize,
                                    ...focusable(theme),
                                }}
                            >
                                Unknown flags
                            </Link>
                            <Link
                                component={RouterLink}
                                to='/archive'
                                underline='always'
                                sx={{
                                    marginRight: 2,
                                    fontSize: theme.typography.body2.fontSize,
                                    ...focusable(theme),
                                }}
                                onClick={() => {
                                    trackEvent('search-feature-buttons', {
                                        props: {
                                            action: 'archive',
                                        },
                                    });
                                }}
                            >
                                Archived flags
                            </Link>
                            <ExportFlags
                                onClick={() => setShowExportDialog(true)}
                            />
                        </>
                    }
                />
            }
        >
            <FeaturesOverviewLifecycleFilters
                state={filterState}
                onChange={setTableState}
            >
                {!isLargeScreen ? (
                    <Search
                        placeholder='Search'
                        initialValue={tableState.query || ''}
                        onChange={setSearchValue}
                        id='globalFeatureFlags'
                    />
                ) : null}
            </FeaturesOverviewLifecycleFilters>
            <FeaturesOverviewToggleFilters
                onChange={setTableState}
                state={filterState}
            />
            {isLargeScreen ? (
                <Box sx={(theme) => ({ padding: theme.spacing(0, 3, 3) })}>
                    <Search
                        initialValue={tableState.query || ''}
                        onChange={setSearchValue}
                        id='globalFeatureFlags'
                    />
                </Box>
            ) : null}
            <SearchHighlightProvider value={tableState.query || ''}>
                <div ref={bodyLoadingRef}>
                    <PaginatedTable tableInstance={table} totalItems={total} />
                </div>
            </SearchHighlightProvider>

            <ConditionallyRender
                condition={rows.length === 0}
                show={
                    <Box sx={(theme) => ({ padding: theme.spacing(0, 2, 2) })}>
                        <ConditionallyRender
                            condition={(tableState.query || '')?.length > 0}
                            show={
                                <TablePlaceholder>
                                    No feature flags found matching &ldquo;
                                    {tableState.query}
                                    &rdquo;
                                </TablePlaceholder>
                            }
                            elseShow={
                                <TablePlaceholder>
                                    No feature flags found matching your
                                    criteria.
                                </TablePlaceholder>
                            }
                        />
                    </Box>
                }
            />
            <ExportDialog
                showExportDialog={showExportDialog}
                data={data}
                onClose={() => setShowExportDialog(false)}
                environments={enabledEnvironments}
            />
        </PageContent>
    );
};
