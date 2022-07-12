import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SortingRule, useGlobalFilter, useSortBy, useTable } from 'react-table';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
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
import { PlaygroundFeatureSchema } from '../playground.model';

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

    const [searchValue, setSearchValue] = useState(
        searchParams.get('search') || ''
    );

    const {
        data: searchedData,
        getSearchText,
        getSearchContext,
    } = useSearch(COLUMNS, searchValue, features || []);

    const data = useMemo(() => {
        return loading
            ? Array(5).fill({
                  name: 'Feature name',
                  project: 'Feature Project',
                  variant: 'Feature variant',
                  enabled: 'Feature state',
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
        }

        setSearchParams(tableState, {
            replace: true,
        });
        setValue({ id: sortBy[0].id, desc: sortBy[0].desc || false });

        // eslint-disable-next-line react-hooks/exhaustive-deps -- don't re-render after search params change
    }, [loading, sortBy, searchValue]);

    return (
        <PageContent
            header={
                <PageHeader
                    titleElement={
                        features !== undefined
                            ? `Results (${
                                  rows.length < data.length
                                      ? `${rows.length} of ${data.length}`
                                      : data.length
                              })`
                            : 'Results'
                    }
                    actions={
                        <Search
                            initialValue={searchValue}
                            onChange={setSearchValue}
                            hasFilters
                            getSearchContext={getSearchContext}
                        />
                    }
                />
            }
            isLoading={loading}
        >
            <ConditionallyRender
                condition={!loading && data.length === 0}
                show={() => (
                    <TablePlaceholder>
                        None of the feature toggles were evaluated yet.
                    </TablePlaceholder>
                )}
                elseShow={() => (
                    <>
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
                            condition={searchValue?.length > 0}
                            show={
                                <TablePlaceholder>
                                    No feature toggles found matching &ldquo;
                                    {searchValue}&rdquo;
                                </TablePlaceholder>
                            }
                        />
                    </>
                )}
            />
        </PageContent>
    );
};

const COLUMNS = [
    {
        Header: 'Name',
        accessor: 'name',
        searchable: true,
        width: '60%',
        Cell: ({ value }: any) => (
            <LinkCell title={value} to={`/feature/${value}`} />
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
        maxWidth: 170,
        Cell: ({ value }: any) => <HighlightCell value={value} />,
    },
    {
        Header: 'isEnabled',
        accessor: 'isEnabled',
        maxWidth: 170,
        Cell: ({ value }: any) => <FeatureStatusCell enabled={value} />,
        sortType: 'boolean',
    },
];
