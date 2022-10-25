import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { TablePlaceholder, VirtualizedTable } from 'component/common/Table';
import { SortingRule, useFlexLayout, useSortBy, useTable } from 'react-table';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { useMediaQuery } from '@mui/material';
import { sortTypes } from 'utils/sortTypes';
import { useEffect, useMemo, useState } from 'react';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Search } from 'component/common/Search/Search';
import { featuresPlaceholder } from 'component/feature/FeatureToggleList/FeatureToggleListTable';
import theme from 'themes/theme';
import useToast from 'hooks/useToast';
import { useSearch } from 'hooks/useSearch';
import { useSearchParams } from 'react-router-dom';
import { TimeAgoCell } from '../../common/Table/cells/TimeAgoCell/TimeAgoCell';
import { TextCell } from '../../common/Table/cells/TextCell/TextCell';
import { ChangesetStatusCell } from './ChangesetStatusCell/ChangesetStatusCell';
import { ChangesetActionCell } from './ChangesetActionCell/ChangesetActionCell';
import { AvatarCell } from './AvatarCell/AvatarCell';
import { ChangesetTitleCell } from './ChangesetTitleCell/ChangesetTitleCell';

export interface IChangeSetTableProps {
    changesets: any[];
    title: string;
    refetch: () => void;
    loading: boolean;
    storedParams: SortingRule<string>;
    setStoredParams: (
        newValue:
            | SortingRule<string>
            | ((prev: SortingRule<string>) => SortingRule<string>)
    ) => SortingRule<string>;
    projectId?: string;
}

export const ChangesetTable = ({
    changesets = [],
    loading,
    refetch,
    storedParams,
    setStoredParams,
    title,
    projectId,
}: IChangeSetTableProps) => {
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const isMediumScreen = useMediaQuery(theme.breakpoints.down('lg'));

    const { setToastData, setToastApiError } = useToast();

    const [searchParams, setSearchParams] = useSearchParams();

    const [searchValue, setSearchValue] = useState(
        searchParams.get('search') || ''
    );

    const columns = useMemo(
        () => [
            {
                id: 'Title',
                Header: 'Title',
                minWidth: 200,
                canSort: true,
                accessor: 'id',
                Cell: ChangesetTitleCell,
            },
            {
                Header: 'By',
                accessor: 'createdBy',
                maxWidth: 50,
                minWidth: 50,
                canSort: false,
                Cell: AvatarCell,
            },
            {
                Header: 'Submitted',
                accessor: 'updatedAt',
                searchable: true,
                minWidth: 100,
                Cell: ({ value }: any) => <TimeAgoCell value={value} />,
                sortType: 'alphanumeric',
            },
            {
                Header: 'Environment',
                accessor: 'environment',
                minWidth: 100,
                Cell: ({ value }: any) => <TextCell value={value} />,
                sortType: 'text',
            },
            {
                Header: 'Status',
                accessor: 'state',
                minWidth: 150,
                Cell: ({ value }: any) => <ChangesetStatusCell value={value} />,
                sortType: 'text',
            },
            {
                Header: '',
                id: 'Actions',
                minWidth: 50,
                canSort: false,
                Cell: ChangesetActionCell,
            },
        ],
        //eslint-disable-next-line
        [projectId]
    );

    const {
        data: searchedData,
        getSearchText,
        getSearchContext,
    } = useSearch(columns, searchValue, changesets);

    const data = useMemo(
        () => (loading ? featuresPlaceholder : searchedData),
        [searchedData, loading]
    );

    const [initialState] = useState(() => ({
        sortBy: [
            {
                id: searchParams.get('sort') || storedParams.id,
                desc: searchParams.has('order')
                    ? searchParams.get('order') === 'desc'
                    : storedParams.desc,
            },
        ],
        hiddenColumns: [],
    }));

    const {
        headerGroups,
        rows,
        state: { sortBy },
        prepareRow,
        setHiddenColumns,
    } = useTable(
        {
            columns: columns as any[], // TODO: fix after `react-table` v8 update
            data,
            initialState,
            sortTypes,
            disableSortRemove: true,
            autoResetSortBy: false,
        },
        useFlexLayout,
        useSortBy
    );

    useEffect(() => {
        const hiddenColumns = [''];
        if (isSmallScreen) {
            hiddenColumns.push('createdBy', 'updatedAt');
        }
        setHiddenColumns(hiddenColumns);
    }, [setHiddenColumns, isSmallScreen]);

    useEffect(() => {
        if (loading) {
            return;
        }
        const tableState: Record<string, string> = {};
        tableState.sort = sortBy[0].id;
        if (sortBy[0].desc) {
            tableState.order = 'desc';
        }
        if (searchValue) {
            tableState.search = searchValue;
        }

        setSearchParams(tableState, {
            replace: true,
        });
        setStoredParams({ id: sortBy[0].id, desc: sortBy[0].desc || false });
    }, [loading, sortBy, searchValue]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <PageContent
            isLoading={loading}
            header={
                <PageHeader
                    titleElement={`${title} (${
                        rows.length < data.length
                            ? `${rows.length} of ${data.length}`
                            : data.length
                    })`}
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
                show={() => (
                    <ConditionallyRender
                        condition={searchValue?.length > 0}
                        show={
                            <TablePlaceholder>
                                No changesets found matching &ldquo;
                                {searchValue}&rdquo;
                            </TablePlaceholder>
                        }
                        elseShow={
                            <TablePlaceholder>
                                None of the changesets where submitted yet.
                            </TablePlaceholder>
                        }
                    />
                )}
            />
        </PageContent>
    );
};
