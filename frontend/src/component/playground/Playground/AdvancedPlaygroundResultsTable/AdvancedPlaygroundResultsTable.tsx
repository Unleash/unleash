import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import {
    type ColumnDef,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';

import { TablePlaceholder } from 'component/common/Table';
import { VirtualizedTable } from 'component/common/Table/VirtualizedTable/VirtualizedTable';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Search } from 'component/common/Search/Search';
import { LinkCell } from 'component/common/Table/cells/LinkCell/LinkCell';
import { useSearch } from 'hooks/useSearch';
import { createLocalStorage } from 'utils/createLocalStorage';

import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import useLoading from 'hooks/useLoading';
import { useConditionallyHiddenColumns } from 'hooks/useConditionallyHiddenColumns';
import { AdvancedPlaygroundEnvironmentCell } from './AdvancedPlaygroundEnvironmentCell/AdvancedPlaygroundEnvironmentCell.tsx';
import type {
    AdvancedPlaygroundRequestSchema,
    AdvancedPlaygroundFeatureSchema,
} from 'openapi';
import { capitalizeFirst } from 'utils/capitalizeFirst';
import { AdvancedPlaygroundEnvironmentDiffCell } from './AdvancedPlaygroundEnvironmentCell/AdvancedPlaygroundEnvironmentDiffCell.tsx';
import { useEventTracker } from 'hooks/useEventTracker';
import { countCombinations, getBucket } from './combinationCounter.ts';

const defaultSort = { id: 'name', desc: false };
const { value, setValue } = createLocalStorage(
    'AdvancedPlaygroundResultsTable:v1',
    defaultSort,
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
    const { trackEvent } = useEventTracker();
    if (features) {
        trackEvent('playground', {
            props: {
                eventType: 'number-of-combinations',
                count: getBucket(countCombinations(features)),
            },
        });
    }

    const [searchParams, setSearchParams] = useSearchParams();
    const ref = useLoading(loading);
    const [searchValue, setSearchValue] = useState(
        searchParams.get('search') || '',
    );
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const environmentsCount =
        features && features.length > 0
            ? Object.keys(features[0].environments).length
            : 0;

    const columns = useMemo<
        ColumnDef<AdvancedPlaygroundFeatureSchema, unknown>[]
    >(() => {
        const baseColumns: ColumnDef<
            AdvancedPlaygroundFeatureSchema,
            unknown
        >[] = [
            {
                id: 'name',
                header: 'Name',
                accessorKey: 'name',
                cell: ({ getValue, row: { original } }) => (
                    <LinkCell
                        title={String(getValue() ?? '')}
                        to={`/projects/${original?.projectId}/features/${getValue()}`}
                    />
                ),
                meta: { searchable: true, minWidth: 160 },
            },
            {
                id: 'projectId',
                header: 'Project ID',
                accessorKey: 'projectId',
                sortingFn: 'alphanumeric',
                cell: ({ getValue }) => {
                    const v = String(getValue() ?? '');
                    return <LinkCell title={v} to={`/projects/${v}`} />;
                },
                meta: {
                    filterName: 'projectId',
                    searchable: true,
                    minWidth: 150,
                },
            },
            ...(input?.environments?.map(
                (
                    name: string,
                ): ColumnDef<AdvancedPlaygroundFeatureSchema, unknown> => ({
                    id: `environments.${name}`,
                    header: loading ? '' : capitalizeFirst(name),
                    cell: ({ row }) => (
                        <AdvancedPlaygroundEnvironmentCell
                            value={row.original.environments[name]}
                        />
                    ),
                    meta: { maxWidth: 150, align: 'left' },
                }),
            ) || []),
        ];

        if (environmentsCount > 1) {
            baseColumns.push({
                id: 'diff',
                header: 'Diff',
                cell: ({ row }) => (
                    <AdvancedPlaygroundEnvironmentDiffCell
                        value={row.original.environments}
                    />
                ),
                meta: { minWidth: 150, align: 'left' },
            });
        }

        return baseColumns;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [input, loading]);

    const {
        data: searchedData,
        getSearchText,
        getSearchContext,
    } = useSearch(columns, searchValue, features || []);

    const data = useMemo(() => {
        return loading
            ? (Array(5).fill({
                  name: 'Feature name',
                  projectId: 'Feature Project',
                  environments: { name: 'Feature Environments', variants: [] },
                  enabled: true,
              }) as AdvancedPlaygroundFeatureSchema[])
            : searchedData;
    }, [searchedData, loading]);

    const [initialState] = useState(() => ({
        sorting: [
            {
                id: searchParams.get('sort') || value.id,
                desc: searchParams.has('order')
                    ? searchParams.get('order') === 'desc'
                    : value.desc,
            },
        ],
    }));

    const table = useReactTable({
        columns,
        data,
        initialState,
        defaultColumn: {
            cell: ({ getValue }) => (
                <HighlightCell value={String(getValue() ?? '')} />
            ),
        },
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        autoResetAll: false,
        enableSortingRemoval: false,
        enableMultiSort: false,
    });

    useConditionallyHiddenColumns(
        [
            {
                condition: isSmallScreen,
                columns: ['projectId'],
            },
        ],
        table.setColumnVisibility,
        columns,
    );

    const sorting = table.getState().sorting;
    const rows = table.getRowModel().rows;

    useEffect(() => {
        if (loading) {
            return;
        }
        const sortRule = sorting[0];
        if (!sortRule) {
            return;
        }
        const tableState = Object.fromEntries(searchParams);
        tableState.sort = sortRule.id;
        if (sortRule.desc) {
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
        setValue({ id: sortRule.id, desc: sortRule.desc || false });

        // eslint-disable-next-line react-hooks/exhaustive-deps -- don't re-render after search params change
    }, [loading, sorting, searchValue]);

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
                <Typography variant='subtitle1' sx={{ ml: 1 }}>
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
                            ? 'None of the feature flags were evaluated yet.'
                            : 'No results found.'}
                    </TablePlaceholder>
                )}
                elseShow={() => (
                    <Box ref={ref} sx={{ overflow: 'auto' }}>
                        <SearchHighlightProvider
                            value={getSearchText(searchValue)}
                        >
                            <VirtualizedTable tableInstance={table} />
                        </SearchHighlightProvider>
                        <ConditionallyRender
                            condition={
                                data.length === 0 && searchValue?.length > 0
                            }
                            show={
                                <TablePlaceholder>
                                    No feature flags found matching &ldquo;
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
                                    No features flags to display
                                </TablePlaceholder>
                            }
                        />
                    </Box>
                )}
            />
        </>
    );
};
