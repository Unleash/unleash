import { useCallback, useEffect, useMemo, useState, type VFC } from 'react';
import {
    Box,
    Button,
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
import type { FeatureSchema, FeatureSearchResponseSchema } from 'openapi';
import { FeatureStaleCell } from './FeatureStaleCell/FeatureStaleCell';
import { Search } from 'component/common/Search/Search';
import { useFavoriteFeaturesApi } from 'hooks/api/actions/useFavoriteFeaturesApi/useFavoriteFeaturesApi';
import { FavoriteIconCell } from 'component/common/Table/cells/FavoriteIconCell/FavoriteIconCell';
import { FavoriteIconHeader } from 'component/common/Table/FavoriteIconHeader/FavoriteIconHeader';
import { useEnvironments } from 'hooks/api/getters/useEnvironments/useEnvironments';
import { ExportDialog } from './ExportDialog';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { focusable } from 'themes/themeStyles';
import { FeatureEnvironmentSeenCell } from 'component/common/Table/cells/FeatureSeenCell/FeatureEnvironmentSeenCell';
import useToast from 'hooks/useToast';
import { FeatureToggleFilters } from './FeatureToggleFilters/FeatureToggleFilters';
import { withTableState } from 'utils/withTableState';
import { FeatureTagCell } from 'component/common/Table/cells/FeatureTagCell/FeatureTagCell';
import { FeatureSegmentCell } from 'component/common/Table/cells/FeatureSegmentCell/FeatureSegmentCell';
import { useUiFlag } from 'hooks/useUiFlag';
import { FeatureToggleListActions } from './FeatureToggleListActions/FeatureToggleListActions';
import useLoading from 'hooks/useLoading';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { useFeedback } from '../../feedbackNew/useFeedback';
import ReviewsOutlined from '@mui/icons-material/ReviewsOutlined';
import { useGlobalFeatureSearch } from './useGlobalFeatureSearch';

export const featuresPlaceholder = Array(15).fill({
    name: 'Name of the feature',
    description: 'Short description of the feature',
    type: '-',
    createdAt: new Date(2022, 1, 1),
    project: 'projectID',
});

const columnHelper = createColumnHelper<FeatureSearchResponseSchema>();
const feedbackCategory = 'search';

export const FeatureToggleListTable: VFC = () => {
    const theme = useTheme();
    const featureSearchFeedback = useUiFlag('featureSearchFeedback');
    const { trackEvent } = usePlausibleTracker();
    const { environments } = useEnvironments();
    const enabledEnvironments = environments
        .filter((env) => env.enabled)
        .map((env) => env.name);
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const isMediumScreen = useMediaQuery(theme.breakpoints.down('lg'));
    const [showExportDialog, setShowExportDialog] = useState(false);

    const { setToastApiError } = useToast();
    const { uiConfig } = useUiConfig();

    const variant =
        featureSearchFeedback !== false
            ? featureSearchFeedback?.name ?? ''
            : '';

    const { openFeedback } = useFeedback(
        feedbackCategory,
        'automatic',
        variant,
    );

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
                meta: {
                    width: '1%',
                },
            }),
            columnHelper.accessor('lastSeenAt', {
                header: 'Seen',
                cell: ({ row }) => (
                    <FeatureEnvironmentSeenCell feature={row.original} />
                ),
                meta: {
                    align: 'center',
                    width: '1%',
                },
            }),
            columnHelper.accessor('type', {
                header: 'Type',
                cell: ({ getValue }) => <FeatureTypeCell value={getValue()} />,
                meta: {
                    align: 'center',
                    width: '1%',
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
                meta: {
                    width: '50%',
                },
            }),
            columnHelper.accessor((row) => row.segments?.join('\n') || '', {
                header: 'Segments',
                cell: ({ getValue, row }) => (
                    <FeatureSegmentCell value={getValue()} row={row} />
                ),
                enableSorting: false,
                meta: {
                    width: '1%',
                },
            }),
            columnHelper.accessor(
                (row) =>
                    row.tags
                        ?.map(({ type, value }) => `${type}:${value}`)
                        .join('\n') || '',
                {
                    header: 'Tags',
                    cell: FeatureTagCell,
                    enableSorting: false,
                    meta: {
                        width: '1%',
                    },
                },
            ),
            columnHelper.accessor('createdAt', {
                header: 'Created',
                cell: ({ getValue }) => <DateCell value={getValue()} />,
                meta: {
                    width: '1%',
                },
            }),
            columnHelper.accessor('project', {
                header: 'Project ID',
                cell: ({ getValue }) => (
                    <LinkCell
                        title={getValue()}
                        to={`/projects/${getValue()}`}
                    />
                ),
                meta: {
                    width: '1%',
                },
            }),
            columnHelper.accessor('stale', {
                header: 'State',
                cell: ({ getValue }) => <FeatureStaleCell value={getValue()} />,
                meta: {
                    width: '1%',
                },
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

    const createFeedbackContext = () => {
        openFeedback({
            title: 'How easy was it to use search and filters?',
            positiveLabel: 'What do you like most about search and filters?',
            areasForImprovementsLabel:
                'What should be improved in search and filters page?',
        });
    };

    return (
        <PageContent
            disableLoading={true}
            bodyClass='no-padding'
            header={
                <PageHeader
                    title='Search'
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
                                            id='globalFeatureFlags'
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
                                onClick={() => {
                                    trackEvent('search-feature-buttons', {
                                        props: {
                                            action: 'archive',
                                        },
                                    });
                                }}
                            >
                                View archive
                            </Link>
                            <FeatureToggleListActions
                                onExportClick={() => setShowExportDialog(true)}
                            />
                            {featureSearchFeedback !== false &&
                                featureSearchFeedback?.enabled && (
                                    <>
                                        <ConditionallyRender
                                            condition={
                                                variant === 'withoutText'
                                            }
                                            show={
                                                <Tooltip
                                                    title='Provide feedback'
                                                    arrow
                                                >
                                                    <IconButton
                                                        onClick={
                                                            createFeedbackContext
                                                        }
                                                        size='large'
                                                    >
                                                        <ReviewsOutlined />
                                                    </IconButton>
                                                </Tooltip>
                                            }
                                        />
                                        <ConditionallyRender
                                            condition={variant === 'withText'}
                                            show={
                                                <Button
                                                    startIcon={
                                                        <ReviewsOutlined />
                                                    }
                                                    onClick={
                                                        createFeedbackContext
                                                    }
                                                >
                                                    Provide feedback
                                                </Button>
                                            }
                                        />{' '}
                                        <ConditionallyRender
                                            condition={
                                                variant === 'withTextOutlined'
                                            }
                                            show={
                                                <Button
                                                    startIcon={
                                                        <ReviewsOutlined />
                                                    }
                                                    onClick={
                                                        createFeedbackContext
                                                    }
                                                    variant='outlined'
                                                >
                                                    Provide feedback
                                                </Button>
                                            }
                                        />
                                    </>
                                )}
                        </>
                    }
                >
                    <ConditionallyRender
                        condition={isSmallScreen}
                        show={
                            <Search
                                initialValue={tableState.query || ''}
                                onChange={setSearchValue}
                                id='globalFeatureFlags'
                            />
                        }
                    />
                </PageHeader>
            }
        >
            <FeatureToggleFilters
                onChange={setTableState}
                state={filterState}
            />
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
                                    criteria. Get started by adding a new
                                    feature flag.
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
