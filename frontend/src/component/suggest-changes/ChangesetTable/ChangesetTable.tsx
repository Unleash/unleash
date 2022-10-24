import {PageContent} from 'component/common/PageContent/PageContent';
import {PageHeader} from 'component/common/PageHeader/PageHeader';
import {TablePlaceholder, VirtualizedTable} from 'component/common/Table';
import {SortingRule, useFlexLayout, useSortBy, useTable} from 'react-table';
import {SearchHighlightProvider} from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import {useMediaQuery} from '@mui/material';
import {sortTypes} from 'utils/sortTypes';
import {useEffect, useMemo, useState} from 'react';
import {ConditionallyRender} from 'component/common/ConditionallyRender/ConditionallyRender';
import {Search} from 'component/common/Search/Search';
import {featuresPlaceholder} from 'component/feature/FeatureToggleList/FeatureToggleListTable';
import theme from 'themes/theme';
import useToast from 'hooks/useToast';
import {useSearch} from 'hooks/useSearch';
import {useSearchParams} from 'react-router-dom';
import {TimeAgoCell} from "../../common/Table/cells/TimeAgoCell/TimeAgoCell";
import {TextCell} from "../../common/Table/cells/TextCell/TextCell";
import {ChangesetStatusCell} from './ChangesetStatusCell/ChangesetStatusCell';
import {ChangesetActionCell} from './ChangesetActionCell/ChangesetActionCell';
import {AvatarCell} from "./AvatarCell/AvatarCell";
import {ChangesetTitleCell} from "./ChangesetTitleCell/ChangesetTitleCell";

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
                width: 85,
                canSort: true,
                accessor: 'id',
                Cell: ChangesetTitleCell,
                align: 'center',
            },
            {
                Header: 'By',
                accessor: 'createdBy.imageUrl',
                width: 85,
                canSort: true,
                Cell: AvatarCell,
                align: 'center',
            },
            {
                Header: 'Submitted',
                accessor: 'updateddAt',
                searchable: true,
                minWidth: 100,
                Cell: ({ value, row: { original } }: any) => (
                    <TimeAgoCell
                        value={value}
                    />
                ),
                sortType: 'alphanumeric',
            },
            {
                Header: 'Environment',
                accessor: 'payload.environment',
                width: 150,
                Cell: ({ value }: any) => (
                    <TextCell
                        value={value}
                    />
                ),
                sortType: 'date',
            },
            {
                Header: 'Status',
                accessor: 'status',
                width: 150,
                Cell: ChangesetStatusCell,
                sortType: 'date',
            },
            {
                Header: 'Actions',
                id: 'Actions',
                align: 'center',
                maxWidth: 120,
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
        if (isMediumScreen) {
            hiddenColumns.push('createddBy', 'updatedAt');
        }
        if (isSmallScreen) {
            hiddenColumns.push('createddBy', 'updatedAt');
        }
        setHiddenColumns(hiddenColumns);
    }, [setHiddenColumns, isSmallScreen, isMediumScreen]);

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
                                No feature toggles found matching &ldquo;
                                {searchValue}&rdquo;
                            </TablePlaceholder>
                        }
                        elseShow={
                            <TablePlaceholder>
                                None of the feature toggles were archived yet.
                            </TablePlaceholder>
                        }
                    />
                )}
            />
        </PageContent>
    );
};
