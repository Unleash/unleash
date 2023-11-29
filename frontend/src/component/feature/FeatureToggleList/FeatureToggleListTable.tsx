import { useCallback, useEffect, useMemo, useState, VFC } from 'react';
import {
    IconButton,
    Link,
    Tooltip,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useFlexLayout, usePagination, useSortBy, useTable } from 'react-table';
import { TablePlaceholder, VirtualizedTable } from 'component/common/Table';
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
import { useConditionallyHiddenColumns } from 'hooks/useConditionallyHiddenColumns';
import FileDownload from '@mui/icons-material/FileDownload';
import { useEnvironments } from 'hooks/api/getters/useEnvironments/useEnvironments';
import { ExportDialog } from './ExportDialog';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { focusable } from 'themes/themeStyles';
import { FeatureEnvironmentSeenCell } from 'component/common/Table/cells/FeatureSeenCell/FeatureEnvironmentSeenCell';
import useToast from 'hooks/useToast';
import { sortTypes } from 'utils/sortTypes';
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

export const featuresPlaceholder: FeatureSchema[] = Array(15).fill({
    name: 'Name of the feature',
    description: 'Short description of the feature',
    type: '-',
    createdAt: new Date(2022, 1, 1),
    project: 'projectID',
});

export type PageQueryType = Partial<
    Record<'sort' | 'order' | 'search' | 'favorites', string>
>;

type FeatureToggleListState = {
    page: string;
    pageSize: string;
    sortBy?: string;
    sortOrder?: string;
    projectId?: string;
    search?: string;
    favorites?: string;
} & FeatureTogglesListFilters;

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
            page: '1',
            pageSize: `${DEFAULT_PAGE_LIMIT}`,
            sortBy: 'createdAt',
            sortOrder: 'desc',
            projectId: '',
            search: '',
            favorites: 'true',
        },
        'featureToggleList',
        [...defaultQueryKeys, 'projectId'],
        [...defaultStoredKeys, 'projectId'],
    );
    const offset = (Number(tableState.page) - 1) * Number(tableState?.pageSize);
    const {
        features = [],
        total,
        loading,
        refetch: refetchFeatures,
    } = useFeatureSearch({
        limit: tableState.pageSize,
        offset: `${offset}`,
        sortBy: tableState.sortBy || 'createdAt',
        sortOrder: tableState.sortOrder || 'desc',
        favoritesFirst: tableState.favorites,
        query: tableState.search || '',
        project: tableState.projectId || undefined,
    });
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
        async (feature: any) => {
            try {
                if (feature?.favorite) {
                    await unfavorite(feature.project, feature.name);
                } else {
                    await favorite(feature.project, feature.name);
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
            {
                Header: (
                    <FavoriteIconHeader
                        isActive={tableState.favorites === 'true'}
                        onClick={() =>
                            setTableState({
                                favorites:
                                    tableState.favorites === 'true'
                                        ? 'false'
                                        : 'true',
                            })
                        }
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
            },
            {
                Header: 'Seen',
                accessor: 'lastSeenAt',
                Cell: ({ value, row: { original: feature } }: any) => {
                    return <FeatureEnvironmentSeenCell feature={feature} />;
                },
                align: 'center',
                maxWidth: 80,
            },
            {
                Header: 'Type',
                accessor: 'type',
                Cell: FeatureTypeCell,
                align: 'center',
                maxWidth: 85,
            },
            {
                Header: 'Name',
                accessor: 'name',
                minWidth: 150,
                Cell: FeatureNameCell,
                sortType: 'alphanumeric',
                searchable: true,
            },
            {
                id: 'tags',
                Header: 'Tags',
                accessor: (row: FeatureSchema) =>
                    row.tags
                        ?.map(({ type, value }) => `${type}:${value}`)
                        .join('\n') || '',
                Cell: FeatureTagCell,
                width: 80,
                searchable: true,
            },
            {
                Header: 'Created',
                accessor: 'createdAt',
                Cell: DateCell,
                maxWidth: 150,
            },
            {
                Header: 'Project ID',
                accessor: 'project',
                Cell: ({ value }: { value: string }) => (
                    <LinkCell title={value} to={`/projects/${value}`} />
                ),
                sortType: 'alphanumeric',
                maxWidth: 150,
                filterName: 'project',
                searchable: true,
            },
            {
                Header: 'State',
                accessor: 'stale',
                Cell: FeatureStaleCell,
                sortType: 'boolean',
                maxWidth: 120,
            },
        ],
        [tableState.favorites],
    );

    const data = useMemo(
        () =>
            features?.length === 0 && loading ? featuresPlaceholder : features,
        [features, loading],
    );

    const {
        headerGroups,
        rows,
        prepareRow,
        state: { pageIndex, pageSize, sortBy },
        setHiddenColumns,
    } = useTable(
        {
            columns: columns as any[],
            data,
            initialState,
            sortTypes,
            autoResetHiddenColumns: false,
            autoResetSortBy: false,
            disableSortRemove: true,
            disableMultiSort: true,
            manualSortBy: true,
            manualPagination: true,
        },
        useSortBy,
        useFlexLayout,
        usePagination,
    );

    useEffect(() => {
        setTableState({
            page: `${pageIndex + 1}`,
            pageSize: `${pageSize}`,
            sortBy: sortBy[0]?.id || 'createdAt',
            sortOrder: sortBy[0]?.desc ? 'desc' : 'asc',
        });
    }, [pageIndex, pageSize, sortBy]);

    useConditionallyHiddenColumns(
        [
            {
                condition: !features.some(({ tags }) => tags?.length),
                columns: ['tags'],
            },
            {
                condition: isSmallScreen,
                columns: ['type', 'createdAt', 'tags'],
            },
            {
                condition: isMediumScreen,
                columns: ['lastSeenAt', 'stale'],
            },
        ],
        setHiddenColumns,
        columns,
    );
    const setSearchValue = (search = '') => setTableState({ search });

    if (!(environments.length > 0)) {
        return null;
    }

    return (
        <PageContent
            isLoading={loading}
            header={
                <PageHeader
                    title={
                        total !== undefined
                            ? `Feature toggles (${
                                  rows.length < total
                                      ? `${rows.length} of ${total}`
                                      : rows.length
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
                                            initialValue={tableState.search}
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
                                initialValue={tableState.search}
                                onChange={setSearchValue}
                            />
                        }
                    />
                </PageHeader>
            }
        >
            <FeatureToggleFilters state={tableState} onChange={setTableState} />
            <SearchHighlightProvider value={tableState.search || ''}>
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
                        condition={(tableState.search || '')?.length > 0}
                        show={
                            <TablePlaceholder>
                                No feature toggles found matching &ldquo;
                                {tableState.search}
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
