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
import { SortingRule, useSortBy, useTable } from 'react-table';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { Box, styled, Tab, Tabs, useMediaQuery } from '@mui/material';
import { Link, useSearchParams } from 'react-router-dom';
import { sortTypes } from 'utils/sortTypes';
import { useEffect, useMemo, useState } from 'react';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Search } from 'component/common/Search/Search';
import { featuresPlaceholder } from 'component/feature/FeatureToggleList/FeatureToggleListTable';
import theme from 'themes/theme';
import { useSearch } from 'hooks/useSearch';
import { TimeAgoCell } from 'component/common/Table/cells/TimeAgoCell/TimeAgoCell';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { ChangeRequestStatusCell } from './ChangeRequestStatusCell';
import { AvatarCell } from './AvatarCell';
import { ChangeRequestTitleCell } from './ChangeRequestTitleCell';
import { createLocalStorage } from 'utils/createLocalStorage';
import { useConditionallyHiddenColumns } from 'hooks/useConditionallyHiddenColumns';
import { useStyles } from './ChangeRequestsTabs.styles';
import { FeaturesCell } from './FeaturesCell';
import { HighlightCell } from '../../../common/Table/cells/HighlightCell/HighlightCell';

export interface IChangeRequestTableProps {
    changeRequests: any[];
    loading: boolean;
    projectId: string;
}

const defaultSort: SortingRule<string> & {
    columns?: string[];
} = { id: 'createdAt', desc: true };

const StyledTabContainer = styled('div')({
    paddingLeft: 0,
    paddingBottom: 0,
});

const StyledTabButton = styled(Tab)(({ theme }) => ({
    textTransform: 'none',
    width: 'auto',
    fontSize: theme.fontSizes.bodySize,
    [theme.breakpoints.up('md')]: {
        minWidth: 160,
    },
}));

const ConftigurationLinkBox = styled(Box)(({ theme }) => ({
    textAlign: 'right',
    paddingBottom: theme.spacing(2),
    fontSize: theme.fontSizes.smallBody,
}));

export const ChangeRequestsTabs = ({
    changeRequests = [],
    loading,
    projectId,
}: IChangeRequestTableProps) => {
    const { classes } = useStyles();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const [searchParams, setSearchParams] = useSearchParams();

    const [searchValue, setSearchValue] = useState(
        searchParams.get('search') || '',
    );

    const { value: storedParams, setValue: setStoredParams } =
        createLocalStorage(`${projectId}:ProjectChangeRequest`, defaultSort);

    const [openChangeRequests, closedChangeRequests] = useMemo(() => {
        const open = changeRequests.filter(
            (changeRequest) =>
                changeRequest.state !== 'Cancelled' &&
                changeRequest.state !== 'Rejected' &&
                changeRequest.state !== 'Applied',
        );
        const closed = changeRequests.filter(
            (changeRequest) =>
                changeRequest.state === 'Cancelled' ||
                changeRequest.state === 'Rejected' ||
                changeRequest.state === 'Applied',
        );

        return [open, closed];
    }, [changeRequests]);

    const tabs = [
        {
            title: 'Change requests',
            data: openChangeRequests,
        },
        {
            title: 'Closed',
            data: closedChangeRequests,
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
                accessor: 'title',
                searchable: true,
                Cell: ChangeRequestTitleCell,
            },
            {
                id: 'Updated feature toggles',
                Header: 'Updated feature toggles',
                canSort: false,
                accessor: 'features',
                searchable: true,
                filterName: 'feature',
                filterParsing: (values: Array<{ name: string }>) => {
                    return values?.map(({ name }) => name).join('\n') || '';
                },
                filterBy: (
                    row: { features: Array<{ name: string }> },
                    values: Array<string>,
                ) => {
                    return row.features.find((feature) =>
                        values
                            .map((value) => value.toLowerCase())
                            .includes(feature.name.toLowerCase()),
                    );
                },
                Cell: ({
                    value,
                    row: {
                        original: { title },
                    },
                }: any) => (
                    <FeaturesCell
                        project={projectId}
                        value={value}
                        key={title}
                    />
                ),
            },
            {
                Header: 'By',
                accessor: 'createdBy',
                maxWidth: 180,
                canSort: false,
                Cell: AvatarCell,
                align: 'left',
                searchable: true,
                filterName: 'by',
                filterParsing: (value: { username?: string }) =>
                    value?.username || '',
            },
            {
                Header: 'Submitted',
                accessor: 'createdAt',
                maxWidth: 100,
                Cell: TimeAgoCell,
            },
            {
                Header: 'Environment',
                accessor: 'environment',
                searchable: true,
                maxWidth: 100,
                Cell: HighlightCell,
                filterName: 'environment',
            },
            {
                Header: 'Status',
                accessor: 'state',
                searchable: true,
                maxWidth: '170px',
                Cell: ChangeRequestStatusCell,
                filterName: 'status',
            },
        ],
        //eslint-disable-next-line
        [projectId],
    );

    const {
        data: searchedData,
        getSearchText,
        getSearchContext,
    } = useSearch(columns, searchValue, tabs[activeTab]?.data);

    const data = useMemo(
        () => (loading ? featuresPlaceholder : searchedData),
        [searchedData, loading],
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
            autoResetHiddenColumns: false,
            disableSortRemove: true,
            autoResetSortBy: false,
            defaultColumn: {
                Cell: TextCell,
            },
        },
        useSortBy,
    );

    useConditionallyHiddenColumns(
        [
            {
                condition: isSmallScreen,
                columns: ['createdBy'],
            },
        ],
        setHiddenColumns,
        columns,
    );

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
        setStoredParams((params) => ({
            ...params,
            id: sortBy[0].id,
            desc: sortBy[0].desc || false,
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, sortBy, searchValue, setSearchParams]);

    return (
        <PageContent
            isLoading={loading}
            bodyClass={classes.bodyClass}
            headerClass={classes.header}
            header={
                <PageHeader
                    titleElement={
                        <StyledTabContainer>
                            <Tabs
                                value={tabs[activeTab]?.title}
                                indicatorColor='primary'
                                textColor='primary'
                                variant='scrollable'
                                allowScrollButtonsMobile
                            >
                                {tabs.map((tab, index) => (
                                    <StyledTabButton
                                        key={tab.title}
                                        label={`${tab.title} (${tab.data.length})`}
                                        value={tab.title}
                                        onClick={() => setActiveTab(index)}
                                    />
                                ))}
                            </Tabs>
                        </StyledTabContainer>
                    }
                    actions={
                        <Search
                            placeholder='Search and Filter'
                            expandable
                            initialValue={searchValue}
                            onChange={setSearchValue}
                            hasFilters
                            getSearchContext={getSearchContext}
                            id='changeRequestList'
                        />
                    }
                />
            }
        >
            <ConftigurationLinkBox>
                <Link to={`/projects/${projectId}/settings/change-requests`}>
                    Change request configuration
                </Link>
            </ConftigurationLinkBox>
            <SearchHighlightProvider value={getSearchText(searchValue)}>
                <Table {...getTableProps()}>
                    <SortableTableHeader headerGroups={headerGroups} />
                    <TableBody {...getTableBodyProps()}>
                        {rows.map((row) => {
                            prepareRow(row);
                            return (
                                <TableRow hover {...row.getRowProps()}>
                                    {row.cells.map((cell) => (
                                        <TableCell
                                            {...cell.getCellProps()}
                                            padding='none'
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
                                None of the changes were submitted yet.
                            </TablePlaceholder>
                        }
                    />
                )}
            />
        </PageContent>
    );
};
