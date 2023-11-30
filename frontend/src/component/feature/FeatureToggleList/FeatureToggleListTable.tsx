import { useCallback, useEffect, useMemo, useState, VFC } from 'react';
import {
    IconButton,
    Link,
    Tooltip,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    createColumnHelper,
} from '@tanstack/react-table';
import { PaginatedTable, TablePlaceholder } from 'component/common/Table';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { DateCell } from 'component/common/Table/cells/DateCell/DateCell';
import { LinkCell } from 'component/common/Table/cells/LinkCell/LinkCell';
import { FeatureTypeCell } from 'component/common/Table/cells/FeatureTypeCell/FeatureTypeCell';
import { FeatureNameCell } from 'component/common/Table/cells/FeatureNameCell/FeatureNameCell';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { FeatureSchema } from 'openapi';
import { CreateFeatureButton } from '../CreateFeatureButton/CreateFeatureButton';
import { FeatureStaleCell } from './FeatureStaleCell/FeatureStaleCell';
import { Search } from 'component/common/Search/Search';
import { FeatureTagCell } from 'component/common/Table/cells/FeatureTagCell/FeatureTagCell';
import { useFavoriteFeaturesApi } from 'hooks/api/actions/useFavoriteFeaturesApi/useFavoriteFeaturesApi';
import { FavoriteIconCell } from 'component/common/Table/cells/FavoriteIconCell/FavoriteIconCell';
import { FavoriteIconHeader } from 'component/common/Table/FavoriteIconHeader/FavoriteIconHeader';
import FileDownload from '@mui/icons-material/FileDownload';
import { useEnvironments } from 'hooks/api/getters/useEnvironments/useEnvironments';
import { ExportDialog } from './ExportDialog';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { focusable } from 'themes/themeStyles';
import { FeatureEnvironmentSeenCell } from 'component/common/Table/cells/FeatureSeenCell/FeatureEnvironmentSeenCell';
import useToast from 'hooks/useToast';
import {
    FeatureToggleFilters,
    FeatureTogglesListFilters,
} from './FeatureToggleFilters/FeatureToggleFilters';
import {
    DEFAULT_PAGE_LIMIT,
    useFeatureSearch,
} from 'hooks/api/getters/useFeatureSearch/useFeatureSearch';
import {
    defaultQueryKeys,
    defaultStoredKeys,
    useTableState,
} from 'hooks/useTableState';

export const featuresPlaceholder = Array(15).fill({
    name: 'Name of the feature',
    description: 'Short description of the feature',
    type: '-',
    createdAt: new Date(2022, 1, 1),
    project: 'projectID',
});

type FeatureToggleListState = {
    page?: string;
    pageSize?: string;
    sortBy?: string;
    sortOrder?: string;
    projectId?: string;
    query?: string;
    favoritesFirst?: string;
} & FeatureTogglesListFilters;

const paginationToOffset = <
    T extends {
        page?: string | number;
        pageSize?: string | number;
    },
>(
    state: T,
) => {
    const { page, pageSize, ...rest } = state;
    return {
        ...rest,
        offset: page ? `${(Number(page) - 1) * Number(pageSize)}` : '1',
        limit: `${pageSize || DEFAULT_PAGE_LIMIT}`,
    };
};

const columnHelper = createColumnHelper<FeatureSchema>();

export const FeatureToggleListTable: VFC = () => {
    const theme = useTheme();
    const { environments } = useEnvironments();
    const enabledEnvironments = environments
        .filter((env) => env.enabled)
        .map((env) => env.name);
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const isMediumScreen = useMediaQuery(theme.breakpoints.down('lg'));
    const [showExportDialog, setShowExportDialog] = useState(false);

    const { setToastApiError } = useToast();
    const { uiConfig } = useUiConfig();
    const [tableState, setTableState] = useTableState<FeatureToggleListState>(
        {
            favoritesFirst: 'true',
        },
        'featureToggleList',
        [...defaultQueryKeys, 'projectId'],
        [...defaultStoredKeys, 'projectId'],
    );
    const {
        features = [],
        total,
        loading,
        refetch: refetchFeatures,
        initialLoad,
    } = useFeatureSearch(paginationToOffset(tableState));
    const [initialState] = useState(() => ({
        sortBy: [
            {
                id: tableState.sortBy || 'createdAt',
                desc: tableState.sortOrder === 'desc',
            },
        ],
        hiddenColumns: ['description'],
        pageSize: Number(tableState.pageSize),
        pageIndex: Number(tableState.page) - 1,
    }));
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
            } catch (error) {
                setToastApiError(
                    'Something went wrong, could not update favorite',
                );
            }
        },
        [favorite, refetchFeatures, unfavorite, setToastApiError],
    );

    const columns = useMemo(
        () => [
            columnHelper.accessor('favorite', {
                header: () => (
                    <FavoriteIconHeader
                        isActive={tableState.favoritesFirst === 'true'}
                        onClick={() =>
                            setTableState({
                                favoritesFirst:
                                    tableState.favoritesFirst === 'true'
                                        ? 'false'
                                        : 'true',
                            })
                        }
                    />
                ),
                cell: ({ getValue, row }) => (
                    <>
                        <FavoriteIconCell
                            value={getValue()}
                            onClick={() => onFavorite(row.original)}
                        />
                    </>
                ),
                enableSorting: false,
            }),
            columnHelper.accessor('lastSeenAt', {
                header: 'Seen',
                cell: ({ row }) => (
                    <FeatureEnvironmentSeenCell feature={row.original} />
                ),
                meta: {
                    align: 'center',
                },
            }),
            columnHelper.accessor('type', {
                header: 'Type',
                cell: ({ getValue }) => <FeatureTypeCell value={getValue()} />,
                meta: {
                    align: 'center',
                },
            }),
            columnHelper.accessor('name', {
                header: 'Name',
                // cell: (cell) => <FeatureNameCell value={cell.row} />,
                cell: ({ row }) => (
                    <LinkCell
                        title={row.original.name}
                        subtitle={row.original.description || undefined}
                        to={`/projects/${row.original.project}/features/${row.original.name}`}
                    />
                ),
            }),
            // columnHelper.accessor(
            //     (row) =>
            //         row.tags
            //             ?.map(({ type, value }) => `${type}:${value}`)
            //             .join('\n') || '',
            //     {
            //         header: 'Tags',
            //         cell: ({ getValue, row }) => (
            //             <FeatureTagCell value={getValue()} row={row} />
            //         ),
            //     },
            // ),
            columnHelper.accessor('createdAt', {
                header: 'Created',
                cell: ({ getValue }) => <DateCell value={getValue()} />,
            }),
            columnHelper.accessor('project', {
                header: 'Project ID',
                cell: ({ getValue }) => (
                    <LinkCell
                        title={getValue()}
                        to={`/projects/${getValue()}`}
                    />
                ),
            }),
            columnHelper.accessor('stale', {
                header: 'State',
                cell: ({ getValue }) => <FeatureStaleCell value={getValue()} />,
            }),
        ],
        [tableState.favoritesFirst],
    );

    const data = useMemo(
        () =>
            features?.length === 0 && loading ? featuresPlaceholder : features,
        [initialLoad, features, loading],
    );

    const table = useReactTable({
        columns,
        data,
        enableSorting: true,
        enableMultiSort: false,
        manualPagination: true,
        manualSorting: true,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        enableHiding: true,
        onSortingChange: (newSortBy) => {
            if (typeof newSortBy === 'function') {
                const computedSortBy = newSortBy([
                    {
                        id: tableState.sortBy || 'createdAt',
                        desc: tableState.sortOrder === 'desc',
                    },
                ])[0];
                setTableState({
                    sortBy: computedSortBy?.id,
                    sortOrder: computedSortBy?.desc ? 'desc' : 'asc',
                });
            } else {
                const sortBy = newSortBy[0];
                setTableState({
                    sortBy: sortBy?.id,
                    sortOrder: sortBy?.desc ? 'desc' : 'asc',
                });
            }
        },
        state: {
            sorting: [
                {
                    id: tableState.sortBy || 'createdAt',
                    desc: tableState.sortOrder === 'desc',
                },
            ],
        },
    });

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

    const setSearchValue = (query = '') => setTableState({ query });

    const rows = table.getRowModel().rows;

    if (!(environments.length > 0)) {
        return null;
    }

    return (
        <PageContent
            isLoading={loading}
            bodyClass='noop'
            header={
                <PageHeader
                    title={
                        total !== undefined
                            ? `Feature toggles (${
                                  data.length < total
                                      ? `${data.length} of ${total}`
                                      : data.length
                              })`
                            : 'Feature toggles'
                    }
                    actions={
                        <>
                            <ConditionallyRender
                                condition={!isSmallScreen}
                                show={
                                    <>
                                        <Search
                                            placeholder='Search'
                                            expandable
                                            initialValue={tableState.query}
                                            onChange={setSearchValue}
                                        />
                                        <PageHeader.Divider />
                                    </>
                                }
                            />
                            <Link
                                component={RouterLink}
                                to='/archive'
                                underline='always'
                                sx={{ marginRight: 2, ...focusable(theme) }}
                            >
                                View archive
                            </Link>
                            <ConditionallyRender
                                condition={Boolean(
                                    uiConfig?.flags?.featuresExportImport,
                                )}
                                show={
                                    <Tooltip
                                        title='Export current selection'
                                        arrow
                                    >
                                        <IconButton
                                            onClick={() =>
                                                setShowExportDialog(true)
                                            }
                                            sx={(theme) => ({
                                                marginRight: theme.spacing(2),
                                            })}
                                        >
                                            <FileDownload />
                                        </IconButton>
                                    </Tooltip>
                                }
                            />

                            <CreateFeatureButton
                                loading={false}
                                filter={{ query: '', project: 'default' }}
                            />
                        </>
                    }
                >
                    <ConditionallyRender
                        condition={isSmallScreen}
                        show={
                            <Search
                                initialValue={tableState.query}
                                onChange={setSearchValue}
                            />
                        }
                    />
                </PageHeader>
            }
        >
            <FeatureToggleFilters state={tableState} onChange={setTableState} />
            <SearchHighlightProvider value={tableState.query || ''}>
                <PaginatedTable
                    rows={rows}
                    headerGroups={table.getHeaderGroups()}
                />
            </SearchHighlightProvider>
            <ConditionallyRender
                condition={rows.length === 0}
                show={
                    <ConditionallyRender
                        condition={(tableState.query || '')?.length > 0}
                        show={
                            <TablePlaceholder>
                                No feature toggles found matching &ldquo;
                                {tableState.query}
                                &rdquo;
                            </TablePlaceholder>
                        }
                        elseShow={
                            <TablePlaceholder>
                                No feature toggles available. Get started by
                                adding a new feature toggle.
                            </TablePlaceholder>
                        }
                    />
                }
            />
            <ConditionallyRender
                condition={Boolean(uiConfig?.flags?.featuresExportImport)}
                show={
                    <ExportDialog
                        showExportDialog={showExportDialog}
                        data={data}
                        onClose={() => setShowExportDialog(false)}
                        environments={enabledEnvironments}
                    />
                }
            />
        </PageContent>
    );
};
