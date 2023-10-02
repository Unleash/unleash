import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    SortingRule,
    useFlexLayout,
    useGlobalFilter,
    useSortBy,
    useTable,
} from 'react-table';

import { TablePlaceholder, VirtualizedTable } from 'component/common/Table';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { sortTypes } from 'utils/sortTypes';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Search } from 'component/common/Search/Search';
import { LinkCell } from 'component/common/Table/cells/LinkCell/LinkCell';
import { useSearch } from 'hooks/useSearch';
import { createLocalStorage } from 'utils/createLocalStorage';

import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import useLoading from 'hooks/useLoading';
import { useConditionallyHiddenColumns } from 'hooks/useConditionallyHiddenColumns';
import { AdvancedPlaygroundEnvironmentCell } from './AdvancedPlaygroundEnvironmentCell/AdvancedPlaygroundEnvironmentCell';
import {
    AdvancedPlaygroundRequestSchema,
    AdvancedPlaygroundFeatureSchema,
    AdvancedPlaygroundFeatureSchemaEnvironments,
} from 'openapi';
import { capitalizeFirst } from 'utils/capitalizeFirst';
import { AdvancedPlaygroundEnvironmentDiffCell } from './AdvancedPlaygroundEnvironmentCell/AdvancedPlaygroundEnvironmentDiffCell';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { countCombinations } from './combinationCounter';

const defaultSort: SortingRule<string> = { id: 'name' };
const { value, setValue } = createLocalStorage(
    'AdvancedPlaygroundResultsTable:v1',
    defaultSort
);

interface IAdvancedPlaygroundResultsTableProps {
    features?: AdvancedPlaygroundFeatureSchema[];
    input?: AdvancedPlaygroundRequestSchema;
    loading: boolean;
}

export const AdvancedPlaygroundResultsTable = ({
    features,
    input,
    loading,
}: IAdvancedPlaygroundResultsTableProps) => {
    const { trackEvent } = usePlausibleTracker();
    if (features) {
        trackEvent('playground', {
            props: {
                eventType: 'number-of-combinations',
                count: countCombinations(features),
            },
        });
    }

    const [searchParams, setSearchParams] = useSearchParams();
    const ref = useLoading(loading);
    const [searchValue, setSearchValue] = useState(
        searchParams.get('search') || ''
    );
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const environmentsCount =
        features && features.length > 0
            ? Object.keys(features[0].environments).length
            : 0;

    const COLUMNS = useMemo(() => {
        return [
            {
                Header: 'Name',
                accessor: 'name',
                searchable: true,
                minWidth: 160,
                Cell: ({ value, row: { original } }: any) => (
                    <LinkCell
                        title={value}
                        to={`/projects/${original?.projectId}/features/${value}`}
                    />
                ),
            },
            {
                Header: 'Project ID',
                accessor: 'projectId',
                sortType: 'alphanumeric',
                filterName: 'projectId',
                searchable: true,
                minWidth: 150,
                Cell: ({ value }: any) => (
                    <LinkCell title={value} to={`/projects/${value}`} />
                ),
            },
            ...(input?.environments?.map((name: string) => {
                return {
                    Header: loading ? () => '' : capitalizeFirst(name),
                    maxWidth: 140,
                    id: `environments.${name}`,
                    align: 'flex-start',
                    Cell: ({ row }: any) => (
                        <AdvancedPlaygroundEnvironmentCell
                            value={row.original.environments[name]}
                        />
                    ),
                };
            }) || []),
            ...(environmentsCount > 1
                ? [
                      {
                          Header: 'Diff',
                          minWidth: 150,
                          id: 'diff',
                          align: 'left',
                          Cell: ({
                              row,
                          }: {
                              row: {
                                  original: {
                                      environments: AdvancedPlaygroundFeatureSchemaEnvironments;
                                  };
                              };
                          }) => (
                              <AdvancedPlaygroundEnvironmentDiffCell
                                  value={row.original.environments}
                              />
                          ),
                      },
                  ]
                : []),
        ];
    }, [input]);

    const {
        data: searchedData,
        getSearchText,
        getSearchContext,
    } = useSearch(COLUMNS, searchValue, features || []);

    const data = useMemo(() => {
        return loading
            ? Array(5).fill({
                  name: 'Feature name',
                  projectId: 'Feature Project',
                  environments: { name: 'Feature Environments', variants: [] },
                  enabled: true,
              })
            : searchedData;
    }, [searchedData, loading]);

    const [initialState] = useState(() => ({
        sortBy: [
            {
                id: searchParams.get('sort') || value.id,
                desc: searchParams.has('order')
                    ? searchParams.get('order') === 'desc'
                    : value.desc,
            },
        ],
    }));

    const {
        headerGroups,
        rows,
        state: { sortBy },
        prepareRow,
        setHiddenColumns,
    } = useTable(
        {
            initialState,
            columns: COLUMNS as any,
            data: data as any,
            sortTypes,
            autoResetGlobalFilter: false,
            autoResetHiddenColumns: false,
            autoResetSortBy: false,
            disableSortRemove: true,
            disableMultiSort: true,
            defaultColumn: {
                Cell: HighlightCell,
            },
        },
        useGlobalFilter,
        useFlexLayout,
        useSortBy
    );

    useConditionallyHiddenColumns(
        [
            {
                condition: isSmallScreen,
                columns: ['projectId'],
            },
        ],
        setHiddenColumns,
        COLUMNS
    );

    useEffect(() => {
        if (loading) {
            return;
        }
        const tableState = Object.fromEntries(searchParams);
        tableState.sort = sortBy[0].id;
        if (sortBy[0].desc) {
            tableState.order = 'desc';
        } else if (tableState.order) {
            delete tableState.order;
        }
        if (searchValue) {
            tableState.search = searchValue;
        } else {
            delete tableState.search;
        }

        setSearchParams(tableState, {
            replace: true,
        });
        setValue({ id: sortBy[0].id, desc: sortBy[0].desc || false });

        // eslint-disable-next-line react-hooks/exhaustive-deps -- don't re-render after search params change
    }, [loading, sortBy, searchValue]);

    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                }}
            >
                <Typography variant="subtitle1" sx={{ ml: 1 }}>
                    {features !== undefined && !loading
                        ? `Results (${
                              rows.length < data.length
                                  ? `${rows.length} of ${data.length}`
                                  : data.length
                          })`
                        : 'Results'}
                </Typography>

                <Search
                    initialValue={searchValue}
                    onChange={setSearchValue}
                    hasFilters
                    getSearchContext={getSearchContext}
                    disabled={loading}
                    containerStyles={{ marginLeft: '1rem', maxWidth: '400px' }}
                />
            </Box>
            <ConditionallyRender
                condition={!loading && !data}
                show={() => (
                    <TablePlaceholder>
                        {data === undefined
                            ? 'None of the feature toggles were evaluated yet.'
                            : 'No results found.'}
                    </TablePlaceholder>
                )}
                elseShow={() => (
                    <Box ref={ref} sx={{ overflow: 'auto' }}>
                        <SearchHighlightProvider
                            value={getSearchText(searchValue)}
                        >
                            <VirtualizedTable
                                rows={rows}
                                headerGroups={headerGroups}
                                prepareRow={prepareRow}
                            />
                        </SearchHighlightProvider>
                        <ConditionallyRender
                            condition={
                                data.length === 0 && searchValue?.length > 0
                            }
                            show={
                                <TablePlaceholder>
                                    No feature toggles found matching &ldquo;
                                    {searchValue}&rdquo;
                                </TablePlaceholder>
                            }
                        />

                        <ConditionallyRender
                            condition={
                                data && data.length === 0 && !searchValue
                            }
                            show={
                                <TablePlaceholder>
                                    No features toggles to display
                                </TablePlaceholder>
                            }
                        />
                    </Box>
                )}
            />
        </>
    );
};
