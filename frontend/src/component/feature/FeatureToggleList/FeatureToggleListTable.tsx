import { useCallback, useEffect, useMemo, useState, VFC } from 'react';
import {
    Box,
    IconButton,
    Link,
    Tooltip,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { createColumnHelper, useReactTable } from '@tanstack/react-table';
import { PaginatedTable, TablePlaceholder } from 'component/common/Table';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { DateCell } from 'component/common/Table/cells/DateCell/DateCell';
import { LinkCell } from 'component/common/Table/cells/LinkCell/LinkCell';
import { FeatureTypeCell } from 'component/common/Table/cells/FeatureTypeCell/FeatureTypeCell';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { FeatureSchema, FeatureSearchResponseSchema } from 'openapi';
import { CreateFeatureButton } from '../CreateFeatureButton/CreateFeatureButton';
import { FeatureStaleCell } from './FeatureStaleCell/FeatureStaleCell';
import { Search } from 'component/common/Search/Search';
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
import { FeatureToggleFilters } from './FeatureToggleFilters/FeatureToggleFilters';
import {
    DEFAULT_PAGE_LIMIT,
    useFeatureSearch,
} from 'hooks/api/getters/useFeatureSearch/useFeatureSearch';
import mapValues from 'lodash.mapvalues';
import {
    BooleansStringParam,
    FilterItemParam,
} from 'utils/serializeQueryParams';
import {
    DateParam,
    encodeQueryParams,
    NumberParam,
    StringParam,
    withDefault,
} from 'use-query-params';
import { withTableState } from 'utils/withTableState';
import { usePersistentTableState } from 'hooks/usePersistentTableState';
import { FeatureTagCell } from 'component/common/Table/cells/FeatureTagCell/FeatureTagCell';
import { FeatureSegmentCell } from 'component/common/Table/cells/FeatureSegmentCell/FeatureSegmentCell';

export const featuresPlaceholder = Array(15).fill({
    name: 'Name of the feature',
    description: 'Short description of the feature',
    type: '-',
    createdAt: new Date(2022, 1, 1),
    project: 'projectID',
});

const columnHelper = createColumnHelper<FeatureSearchResponseSchema>();

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

    const config = {
        offset: withDefault(NumberParam, 0),
        limit: withDefault(NumberParam, DEFAULT_PAGE_LIMIT),
        query: StringParam,
        favoritesFirst: withDefault(BooleansStringParam, true),
        sortBy: withDefault(StringParam, 'createdAt'),
        sortOrder: withDefault(StringParam, 'desc'),
        project: FilterItemParam,
        state: FilterItemParam,
        segment: FilterItemParam,
        createdAt: DateParam,
    };
    const [tableState, setTableState] = usePersistentTableState(
        'features-list-table',
        config,
    );

    const {
        features = [],
        total,
        loading,
        refetch: refetchFeatures,
        initialLoad,
    } = useFeatureSearch(
        mapValues(encodeQueryParams(config, tableState), (value) =>
            value ? `${value}` : undefined,
        ),
    );
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
                        isActive={tableState.favoritesFirst}
                        onClick={() =>
                            setTableState({
                                favoritesFirst: !tableState.favoritesFirst,
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
            columnHelper.accessor((row) => row.segments?.join('\n') || '', {
                header: 'Segments',
                cell: ({ getValue, row }) => (
                    <FeatureSegmentCell value={getValue()} row={row} />
                ),
            }),
            columnHelper.accessor(
                (row) =>
                    row.tags
                        ?.map(({ type, value }) => `${type}:${value}`)
                        .join('\n') || '',
                {
                    header: 'Tags',
                    cell: ({ getValue, row }) => (
                        <FeatureTagCell value={getValue()} row={row} />
                    ),
                },
            ),
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

    const setSearchValue = (query = '') => setTableState({ query });

    const rows = table.getRowModel().rows;

    if (!(environments.length > 0)) {
        return null;
    }

    return (
        <PageContent
            isLoading={loading}
            bodyClass='no-padding'
            header={
                <PageHeader
                    title='Feature toggles'
                    actions={
                        <>
                            <ConditionallyRender
                                condition={!isSmallScreen}
                                show={
                                    <>
                                        <Search
                                            placeholder='Search'
                                            expandable
                                            initialValue={
                                                tableState.query || ''
                                            }
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
                                initialValue={tableState.query || ''}
                                onChange={setSearchValue}
                            />
                        }
                    />
                </PageHeader>
            }
        >
            <FeatureToggleFilters onChange={setTableState} state={tableState} />
            <SearchHighlightProvider value={tableState.query || ''}>
                <PaginatedTable tableInstance={table} totalItems={total} />
            </SearchHighlightProvider>
            <ConditionallyRender
                condition={rows.length === 0}
                show={
                    <Box sx={(theme) => ({ padding: theme.spacing(0, 2, 2) })}>
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
                    </Box>
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
