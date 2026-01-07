import { type ReactNode, useEffect, useMemo, useState } from 'react';
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
import { type SortingRule, useSortBy, useTable } from 'react-table';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { Box, styled, Tab, Tabs, useMediaQuery } from '@mui/material';
import { Link, useSearchParams } from 'react-router-dom';
import { sortTypes } from 'utils/sortTypes';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Search } from 'component/common/Search/Search';
import { featuresPlaceholder } from 'component/feature/FeatureToggleList/FeatureToggleListTable';
import theme from 'themes/theme';
import { useSearch } from 'hooks/useSearch';
import { TimeAgoCell } from 'component/common/Table/cells/TimeAgoCell/TimeAgoCell';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { ChangeRequestStatusCell } from './ChangeRequestStatusCell.tsx';
import { AvatarCell } from './AvatarCell.tsx';
import { ChangeRequestTitleCell } from './ChangeRequestTitleCell.tsx';
import { createLocalStorage } from 'utils/createLocalStorage';
import { useConditionallyHiddenColumns } from 'hooks/useConditionallyHiddenColumns';
import { useStyles } from './ChangeRequestsTabs.styles';
import { FeaturesCell } from './FeaturesCell.tsx';
import { HighlightCell } from '../../../common/Table/cells/HighlightCell/HighlightCell.tsx';

export interface IChangeRequestTableProps {
    changeRequests: any[];
    loading: boolean;
    projectId: string;
    placeholder?: ReactNode;
}

const defaultSort: SortingRule<string> & {
    columns?: string[];
    type?: 'open' | 'closed';
} = { id: 'createdAt', desc: true };

const StyledTabContainer = styled('div')({
    paddingLeft: 0,
    paddingBottom: 0,
});

const StyledTabButton = styled(Tab)(({ theme }) => ({
    textTransform: 'none',
    width: 'auto',
    fontSize: theme.typography.body2.fontSize,
    [theme.breakpoints.up('md')]: {
        minWidth: 160,
    },
}));

const ConftigurationLinkBox = styled(Box)(({ theme }) => ({
    textAlign: 'right',
    paddingBottom: theme.spacing(2),
    fontSize: theme.fontSizes.smallBody,
}));

const StyledTable = styled(Table)(() => ({
    th: {
        whiteSpace: 'nowrap',
    },

    td: {
        verticalAlign: 'top',
        maxWidth: '250px',
    },
}));

export const ChangeRequestsTabs = ({
    changeRequests = [],
    placeholder,
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

    const initialChangeRequestType =
        searchParams.get('type') || storedParams.type;
    const [changeRequestType, setChangeRequestType] = useState<
        'open' | 'closed'
    >(initialChangeRequestType === 'closed' ? 'closed' : 'open');

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
            title: 'Open',
            data: openChangeRequests,
            type: 'open' as const,
        },
        {
            title: 'Closed',
            data: closedChangeRequests,
            type: 'closed' as const,
        },
    ];
    const activeTab =
        tabs.find((tab) => tab.type === changeRequestType) || tabs[0];

    const columns = useMemo(
        () => [
            {
                id: 'Title',
                Header: 'Title',
                canSort: true,
                accessor: 'title',
                searchable: true,
                Cell: ChangeRequestTitleCell,
            },
            {
                id: 'Updated feature flags',
                Header: 'Updated feature flags',
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
                width: '10%',
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
                width: '5%',
                Cell: TimeAgoCell,
            },
            {
                Header: 'Environment',
                accessor: 'environment',
                searchable: true,
                width: '10%',
                Cell: HighlightCell,
                filterName: 'environment',
            },
            {
                Header: 'Status',
                accessor: 'state',
                searchable: true,
                maxWidth: '170px',
                width: '10%',
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
    } = useSearch(columns, searchValue, activeTab?.data);

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
        tableState.type = changeRequestType;

        setSearchParams(tableState, {
            replace: true,
        });
        setStoredParams((params) => ({
            ...params,
            id: sortBy[0].id,
            desc: sortBy[0].desc || false,
            type: changeRequestType,
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, sortBy, searchValue, setSearchParams, changeRequestType]);

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
                                value={activeTab?.title}
                                indicatorColor='primary'
                                textColor='primary'
                                variant='scrollable'
                                allowScrollButtonsMobile
                            >
                                {tabs.map((tab) => (
                                    <StyledTabButton
                                        key={tab.title}
                                        label={`${tab.title} (${tab.data.length})`}
                                        value={tab.title}
                                        onClick={() =>
                                            setChangeRequestType(tab.type)
                                        }
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
                <StyledTable {...getTableProps()}>
                    <SortableTableHeader headerGroups={headerGroups} />
                    <TableBody {...getTableBodyProps()}>
                        {rows.map((row) => {
                            prepareRow(row);
                            const { key, ...rowProps } = row.getRowProps();
                            return (
                                <TableRow hover key={key} {...rowProps}>
                                    {row.cells.map((cell) => {
                                        const { key, ...cellProps } =
                                            cell.getCellProps();

                                        return (
                                            <TableCell key={key} {...cellProps}>
                                                {cell.render('Cell')}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </StyledTable>
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
                                {placeholder ||
                                    'None of the changes were submitted yet.'}
                            </TablePlaceholder>
                        }
                    />
                )}
            />
        </PageContent>
    );
};
