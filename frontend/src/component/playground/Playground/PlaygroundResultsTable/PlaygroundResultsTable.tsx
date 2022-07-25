import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SortingRule, useGlobalFilter, useSortBy, useTable } from 'react-table';

import {
    SortableTableHeader,
    Table,
    TableBody,
    TableCell,
    TablePlaceholder,
    TableRow,
} from 'component/common/Table';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { sortTypes } from 'utils/sortTypes';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Search } from 'component/common/Search/Search';
import { LinkCell } from 'component/common/Table/cells/LinkCell/LinkCell';
import { useSearch } from 'hooks/useSearch';
import { createLocalStorage } from 'utils/createLocalStorage';
import { FeatureStatusCell } from './FeatureStatusCell/FeatureStatusCell';
import { PlaygroundFeatureSchema } from 'hooks/api/actions/usePlayground/playground.model';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import useLoading from 'hooks/useLoading';
import { VariantCell } from './VariantCell/VariantCell';

const defaultSort: SortingRule<string> = { id: 'name' };
const { value, setValue } = createLocalStorage(
    'PlaygroundResultsTable:v1',
    defaultSort
);

interface IPlaygroundResultsTableProps {
    features?: PlaygroundFeatureSchema[];
    loading: boolean;
}

export const PlaygroundResultsTable = ({
    features,
    loading,
}: IPlaygroundResultsTableProps) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const ref = useLoading(loading);
    const [searchValue, setSearchValue] = useState(
        searchParams.get('search') || ''
    );
    const theme = useTheme();
    const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    const {
        data: searchedData,
        getSearchText,
        getSearchContext,
    } = useSearch(COLUMNS, searchValue, features || []);

    const data = useMemo(() => {
        return loading
            ? Array(5).fill({
                  name: 'Feature name',
                  projectId: 'FeatureProject',
                  variant: { name: 'FeatureVariant', variants: [] },
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
        getTableProps,
        getTableBodyProps,
        headerGroups,
        state: { sortBy },
        rows,
        prepareRow,
        setHiddenColumns,
    } = useTable(
        {
            initialState,
            columns: COLUMNS as any,
            data: data as any,
            sortTypes,
            autoResetGlobalFilter: false,
            autoResetSortBy: false,
            disableSortRemove: true,
            defaultColumn: {
                Cell: HighlightCell,
            },
        },
        useGlobalFilter,
        useSortBy
    );

    useEffect(() => {
        const hiddenColumns = [];
        if (isSmallScreen) {
            hiddenColumns.push('projectId');
        }
        if (isExtraSmallScreen) {
            hiddenColumns.push('variant');
        }
        setHiddenColumns(hiddenColumns);
    }, [setHiddenColumns, isExtraSmallScreen, isSmallScreen]);

    useEffect(() => {
        if (loading) {
            return;
        }
        const tableState: Record<string, string> =
            Object.fromEntries(searchParams);
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
                    <Box ref={ref}>
                        <SearchHighlightProvider
                            value={getSearchText(searchValue)}
                        >
                            <Table {...getTableProps()} rowHeight="standard">
                                <SortableTableHeader
                                    headerGroups={headerGroups as any}
                                />
                                <TableBody {...getTableBodyProps()}>
                                    {rows.map(row => {
                                        prepareRow(row);
                                        return (
                                            <TableRow
                                                hover
                                                {...row.getRowProps()}
                                            >
                                                {row.cells.map(cell => (
                                                    <TableCell
                                                        {...cell.getCellProps()}
                                                    >
                                                        {cell.render('Cell')}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
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

const COLUMNS = [
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
        maxWidth: 170,
        Cell: ({ value }: any) => (
            <LinkCell title={value} to={`/projects/${value}`} />
        ),
    },
    {
        Header: 'Variant',
        id: 'variant',
        accessor: 'variant.name',
        sortType: 'alphanumeric',
        filterName: 'variant',
        searchable: true,
        width: 200,
        Cell: ({
            value,
            row: {
                original: { variant, feature, variants, isEnabled },
            },
        }: any) => (
            <VariantCell
                variant={variant?.enabled ? value : ''}
                variants={variants}
                feature={feature}
                isEnabled={isEnabled}
            />
        ),
    },
    {
        Header: 'isEnabled',
        accessor: 'isEnabled',
        filterName: 'isEnabled',
        filterParsing: (value: boolean) => (value ? 'true' : 'false'),
        Cell: ({ value }: any) => <FeatureStatusCell enabled={value} />,
        sortType: 'boolean',
        sortInverted: true,
    },
];
