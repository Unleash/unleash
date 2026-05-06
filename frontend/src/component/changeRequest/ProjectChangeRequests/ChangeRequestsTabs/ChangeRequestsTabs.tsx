import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { isClosed } from 'component/changeRequest/changeRequest.types';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import {
    Table,
    TableBody,
    TableCell,
    TablePlaceholder,
    TableRow,
} from 'component/common/Table';
import { SortableTableHeader } from 'component/common/Table/SortableTableHeader/SortableTableHeader';
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { Box, styled, Tab, Tabs, useMediaQuery } from '@mui/material';
import { Link, useSearchParams } from 'react-router-dom';
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

const defaultSort: {
    id: string;
    desc: boolean;
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

const ConfigurationLinkBox = styled(Box)(({ theme }) => ({
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

    const { openChangeRequests = [], closedChangeRequests = [] } = useMemo(
        () =>
            Object.groupBy(changeRequests, ({ state }) =>
                isClosed(state) ? 'closedChangeRequests' : 'openChangeRequests',
            ),
        [changeRequests],
    );

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

    const columns = useMemo<ColumnDef<any, unknown>[]>(
        () => [
            {
                id: 'Title',
                header: 'Title',
                accessorKey: 'title',
                cell: ({ getValue, row }) => (
                    <ChangeRequestTitleCell
                        value={getValue() as string}
                        row={row}
                    />
                ),
                meta: { searchable: true },
            },
            {
                id: 'Updated feature flags',
                header: 'Updated feature flags',
                accessorKey: 'features',
                enableSorting: false,
                cell: ({
                    getValue,
                    row: {
                        original: { title },
                    },
                }) => (
                    <FeaturesCell
                        project={projectId}
                        value={getValue()}
                        key={title}
                    />
                ),
                meta: {
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
                },
            },
            {
                id: 'createdBy',
                header: 'By',
                accessorKey: 'createdBy',
                enableSorting: false,
                cell: ({ getValue }) => (
                    <AvatarCell value={getValue() as any} />
                ),
                meta: {
                    width: '10%',
                    align: 'left',
                    searchable: true,
                    filterName: 'by',
                    filterParsing: (value: { username?: string }) =>
                        value?.username || '',
                },
            },
            {
                id: 'createdAt',
                header: 'Submitted',
                accessorKey: 'createdAt',
                cell: TimeAgoCell,
                meta: { maxWidth: 100, width: '5%' },
            },
            {
                id: 'environment',
                header: 'Environment',
                accessorKey: 'environment',
                cell: HighlightCell,
                meta: {
                    searchable: true,
                    width: '10%',
                    filterName: 'environment',
                },
            },
            {
                id: 'state',
                header: 'Status',
                accessorKey: 'state',
                cell: ({ getValue, row }) => (
                    <ChangeRequestStatusCell
                        value={getValue() as string}
                        row={row}
                    />
                ),
                meta: {
                    searchable: true,
                    maxWidth: '170px',
                    width: '10%',
                    filterName: 'status',
                },
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        sorting: [
            {
                id: searchParams.get('sort') || storedParams.id,
                desc: searchParams.has('order')
                    ? searchParams.get('order') === 'desc'
                    : storedParams.desc,
            },
        ],
    }));

    const table = useReactTable({
        columns,
        data,
        initialState,
        defaultColumn: {
            cell: ({ getValue }) => (
                <TextCell value={String(getValue() ?? '')} />
            ),
        },
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        autoResetAll: false,
        enableSortingRemoval: false,
    });

    useConditionallyHiddenColumns(
        [
            {
                condition: isSmallScreen,
                columns: ['createdBy'],
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
        const tableState: Record<string, string> = {};
        tableState.sort = sortRule.id;
        if (sortRule.desc) {
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
            id: sortRule.id,
            desc: sortRule.desc || false,
            type: changeRequestType,
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, sorting, searchValue, setSearchParams, changeRequestType]);

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
            <ConfigurationLinkBox>
                <Link to={`/projects/${projectId}/settings/change-requests`}>
                    Change request configuration
                </Link>
            </ConfigurationLinkBox>
            <SearchHighlightProvider value={getSearchText(searchValue)}>
                <StyledTable>
                    <SortableTableHeader tableInstance={table} />
                    <TableBody>
                        {rows.map((row) => (
                            <TableRow hover key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext(),
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
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
