import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import {
    SortableTableHeader,
    Table,
    TableCell,
    TablePlaceholder,
} from 'component/common/Table';
import { SortingRule, useSortBy, useTable } from 'react-table';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { Tab, Tabs, useMediaQuery } from '@mui/material';
import { sortTypes } from 'utils/sortTypes';
import { useEffect, useMemo, useState } from 'react';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Search } from 'component/common/Search/Search';
import { featuresPlaceholder } from 'component/feature/FeatureToggleList/FeatureToggleListTable';
import theme from 'themes/theme';
import { useSearch } from 'hooks/useSearch';
import { useSearchParams } from 'react-router-dom';
import { TimeAgoCell } from '../../../common/Table/cells/TimeAgoCell/TimeAgoCell';
import { TextCell } from '../../../common/Table/cells/TextCell/TextCell';
import { ChangesetStatusCell } from './ChangesetStatusCell/ChangesetStatusCell';
import { ChangesetActionCell } from './ChangesetActionCell/ChangesetActionCell';
import { AvatarCell } from './AvatarCell/AvatarCell';
import { ChangesetTitleCell } from './ChangesetTitleCell/ChangesetTitleCell';
import { TableBody, TableRow } from '../../../common/Table';
import { useStyles } from './SuggestionsTabs.styles';

export interface IChangeSetTableProps {
    changesets: any[];
    loading: boolean;
    storedParams: SortingRule<string>;
    setStoredParams: (
        newValue:
            | SortingRule<string>
            | ((prev: SortingRule<string>) => SortingRule<string>)
    ) => SortingRule<string>;
    projectId: string;
}

export const SuggestionsTabs = ({
    changesets = [],
    loading,
    storedParams,
    setStoredParams,
    projectId,
}: IChangeSetTableProps) => {
    const { classes } = useStyles();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const [searchParams, setSearchParams] = useSearchParams();

    const [searchValue, setSearchValue] = useState(
        searchParams.get('search') || ''
    );

    const [openChangesets, closedChangesets] = useMemo(() => {
        const open = changesets.filter(
            changeset =>
                changeset.state !== 'Cancelled' && changeset.state !== 'Applied'
        );
        const closed = changesets.filter(
            changeset =>
                changeset.state === 'Cancelled' || changeset.state === 'Applied'
        );

        return [open, closed];
    }, [changesets]);

    const tabs = [
        {
            title: 'Suggestions',
            data: openChangesets,
        },
        {
            title: 'Closed',
            data: closedChangesets,
        },
    ];

    const [activeTab, setActiveTab] = useState(0);

    const columns = useMemo(
        () => [
            {
                id: 'Title',
                Header: 'Title',
                width: 100,
                canSort: true,
                accessor: 'id',
                Cell: ChangesetTitleCell,
            },
            {
                Header: 'By',
                accessor: 'createdBy',
                maxWidth: 50,
                canSort: false,
                Cell: AvatarCell,
                align: 'center',
            },
            {
                Header: 'Submitted',
                accessor: 'createdAt',
                searchable: true,
                maxWidth: 100,
                Cell: TimeAgoCell,
                sortType: 'alphanumeric',
            },
            {
                Header: 'Environment',
                accessor: 'environment',
                maxWidth: 100,
                Cell: TextCell,
                sortType: 'text',
            },
            {
                Header: 'Status',
                accessor: 'state',
                minWidth: 150,
                width: 150,
                Cell: ChangesetStatusCell,
                sortType: 'text',
            },
            {
                Header: '',
                id: 'Actions',
                minWidth: 50,
                width: 50,
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
    } = useSearch(columns, searchValue, tabs[activeTab]?.data);

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
        getTableProps,
        getTableBodyProps,
    } = useTable(
        {
            columns: columns as any[], // TODO: fix after `react-table` v8 update
            data,
            initialState,
            sortTypes,
            disableSortRemove: true,
            autoResetSortBy: false,
            defaultColumn: {
                Cell: TextCell,
            },
        },
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
            headerClass={classes.header}
            header={
                <PageHeader
                    titleElement={
                        <div className={classes.tabContainer}>
                            <Tabs
                                value={tabs[activeTab]?.title}
                                indicatorColor="primary"
                                textColor="primary"
                            >
                                {tabs.map((tab, index) => (
                                    <Tab
                                        key={tab.title}
                                        label={`${tab.title} (${tab.data.length})`}
                                        value={tab.title}
                                        onClick={() => setActiveTab(index)}
                                        className={classes.tabButton}
                                    />
                                ))}
                            </Tabs>
                        </div>
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
        >
            <SearchHighlightProvider value={getSearchText(searchValue)}>
                <Table {...getTableProps()}>
                    <SortableTableHeader headerGroups={headerGroups} />
                    <TableBody {...getTableBodyProps()}>
                        {rows.map(row => {
                            prepareRow(row);
                            return (
                                <TableRow hover {...row.getRowProps()}>
                                    {row.cells.map(cell => (
                                        <TableCell
                                            {...cell.getCellProps()}
                                            padding="none"
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
                condition={rows.length === 0}
                show={() => (
                    <ConditionallyRender
                        condition={searchValue?.length > 0}
                        show={
                            <TablePlaceholder>
                                No changes found matching &ldquo;
                                {searchValue}&rdquo;
                            </TablePlaceholder>
                        }
                        elseShow={
                            <TablePlaceholder>
                                None of the changes where submitted yet.
                            </TablePlaceholder>
                        }
                    />
                )}
            />
        </PageContent>
    );
};
