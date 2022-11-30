import { useEffect, useMemo, useState, VFC } from 'react';
import { Link, useMediaQuery, useTheme } from '@mui/material';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { SortingRule, useFlexLayout, useSortBy, useTable } from 'react-table';
import { TablePlaceholder, VirtualizedTable } from 'component/common/Table';
import { useFeatures } from 'hooks/api/getters/useFeatures/useFeatures';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { DateCell } from 'component/common/Table/cells/DateCell/DateCell';
import { LinkCell } from 'component/common/Table/cells/LinkCell/LinkCell';
import { FeatureSeenCell } from 'component/common/Table/cells/FeatureSeenCell/FeatureSeenCell';
import { FeatureTypeCell } from 'component/common/Table/cells/FeatureTypeCell/FeatureTypeCell';
import { FeatureNameCell } from 'component/common/Table/cells/FeatureNameCell/FeatureNameCell';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { createLocalStorage } from 'utils/createLocalStorage';
import { FeatureSchema } from 'openapi';
import { CreateFeatureButton } from '../CreateFeatureButton/CreateFeatureButton';
import { FeatureStaleCell } from './FeatureStaleCell/FeatureStaleCell';
import { useSearch } from 'hooks/useSearch';
import { Search } from 'component/common/Search/Search';
import { FeatureTagCell } from 'component/common/Table/cells/FeatureTagCell/FeatureTagCell';
import { usePinnedFavorites } from 'hooks/usePinnedFavorites';
import { useFavoriteFeaturesApi } from 'hooks/api/actions/useFavoriteFeaturesApi/useFavoriteFeaturesApi';
import { FavoriteIconCell } from './FavoriteIconCell/FavoriteIconCell';
import { FavoriteIconHeader } from './FavoriteIconHeader/FavoriteIconHeader';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

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

const defaultSort: SortingRule<string> = { id: 'createdAt' };

const { value: storedParams, setValue: setStoredParams } = createLocalStorage(
    'FeatureToggleListTable:v1',
    { ...defaultSort, favorites: false }
);

export const FeatureToggleListTable: VFC = () => {
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const isMediumScreen = useMediaQuery(theme.breakpoints.down('lg'));
    const { features = [], loading } = useFeatures();
    const [searchParams, setSearchParams] = useSearchParams();
    const [initialState] = useState(() => ({
        sortBy: [
            {
                id: searchParams.get('sort') || storedParams.id,
                desc: searchParams.has('order')
                    ? searchParams.get('order') === 'desc'
                    : storedParams.desc,
            },
        ],
        hiddenColumns: ['description'],
        globalFilter: searchParams.get('search') || '',
    }));
    const { isFavoritesPinned, sortTypes, onChangeIsFavoritePinned } =
        usePinnedFavorites(
            searchParams.has('favorites')
                ? searchParams.get('favorites') === 'true'
                : storedParams.favorites
        );
    const [searchValue, setSearchValue] = useState(initialState.globalFilter);
    const { favorite, unfavorite } = useFavoriteFeaturesApi();
    const { uiConfig } = useUiConfig();

    const columns = useMemo(
        () => [
            ...(uiConfig?.flags?.favorites
                ? [
                      {
                          Header: (
                              <FavoriteIconHeader
                                  isActive={isFavoritesPinned}
                                  onClick={onChangeIsFavoritePinned}
                              />
                          ),
                          accessor: 'favorite',
                          Cell: ({ row: { original: feature } }: any) => (
                              <FavoriteIconCell
                                  value={feature?.favorite}
                                  onClick={() =>
                                      feature?.favorite
                                          ? unfavorite(
                                                feature.project,
                                                feature.name
                                            )
                                          : favorite(
                                                feature.project,
                                                feature.name
                                            )
                                  }
                              />
                          ),
                          maxWidth: 50,
                          disableSortBy: true,
                      },
                  ]
                : []),
            {
                Header: 'Seen',
                accessor: 'lastSeenAt',
                Cell: FeatureSeenCell,
                sortType: 'date',
                align: 'center',
                maxWidth: 85,
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
                sortType: 'date',
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
                filterName: 'state',
                filterParsing: (value: any) => (value ? 'stale' : 'active'),
            },
            // Always hidden -- for search
            {
                accessor: 'description',
            },
        ],
        [isFavoritesPinned]
    );

    const {
        data: searchedData,
        getSearchText,
        getSearchContext,
    } = useSearch(columns, searchValue, features);

    const data = useMemo(
        () =>
            searchedData?.length === 0 && loading
                ? featuresPlaceholder
                : searchedData,
        [searchedData, loading]
    );

    const {
        headerGroups,
        rows,
        prepareRow,
        state: { sortBy },
        setHiddenColumns,
    } = useTable(
        {
            columns: columns as any[],
            data,
            initialState,
            sortTypes,
            autoResetSortBy: false,
            disableSortRemove: true,
            disableMultiSort: true,
        },
        useSortBy,
        useFlexLayout
    );

    useEffect(() => {
        const hiddenColumns = ['description'];
        if (!features.some(({ tags }) => tags?.length)) {
            hiddenColumns.push('tags');
        }
        if (isMediumScreen) {
            hiddenColumns.push('lastSeenAt', 'stale');
        }
        if (isSmallScreen) {
            hiddenColumns.push('type', 'createdAt', 'tags');
        }
        setHiddenColumns(hiddenColumns);
    }, [setHiddenColumns, isSmallScreen, isMediumScreen, features, columns]);

    useEffect(() => {
        const tableState: PageQueryType = {};
        tableState.sort = sortBy[0].id;
        if (sortBy[0].desc) {
            tableState.order = 'desc';
        }
        if (searchValue) {
            tableState.search = searchValue;
        }
        if (isFavoritesPinned) {
            tableState.favorites = 'true';
        }

        setSearchParams(tableState, {
            replace: true,
        });
        setStoredParams({
            id: sortBy[0].id,
            desc: sortBy[0].desc || false,
            favorites: isFavoritesPinned || false,
        });
    }, [sortBy, searchValue, setSearchParams, isFavoritesPinned]);

    return (
        <PageContent
            isLoading={loading}
            header={
                <PageHeader
                    title={`Feature toggles (${
                        rows.length < data.length
                            ? `${rows.length} of ${data.length}`
                            : data.length
                    })`}
                    actions={
                        <>
                            <ConditionallyRender
                                condition={!isSmallScreen}
                                show={
                                    <>
                                        <Search
                                            initialValue={searchValue}
                                            onChange={setSearchValue}
                                            hasFilters
                                            getSearchContext={getSearchContext}
                                        />
                                        <PageHeader.Divider />
                                    </>
                                }
                            />
                            <Link
                                component={RouterLink}
                                to="/archive"
                                underline="always"
                                sx={{ marginRight: 2 }}
                            >
                                View archive
                            </Link>
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
                                initialValue={searchValue}
                                onChange={setSearchValue}
                                hasFilters
                                getSearchContext={getSearchContext}
                            />
                        }
                    />
                </PageHeader>
            }
        >
            <SearchHighlightProvider value={getSearchText(searchValue)}>
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
                        condition={searchValue?.length > 0}
                        show={
                            <TablePlaceholder>
                                No feature toggles found matching &ldquo;
                                {searchValue}
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
        </PageContent>
    );
};
