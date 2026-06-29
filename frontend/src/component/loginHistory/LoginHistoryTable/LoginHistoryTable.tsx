import { useEffect, useMemo, useState } from 'react';
import { TablePlaceholder } from 'component/common/Table';
import { VirtualizedTable } from 'component/common/Table/VirtualizedTable/VirtualizedTable';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { IconButton, Tooltip, useMediaQuery } from '@mui/material';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import {
    type ColumnDef,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import theme from 'themes/theme';
import { Search } from 'component/common/Search/Search';
import { useConditionallyHiddenColumns } from 'hooks/useConditionallyHiddenColumns';
import { useSearch } from 'hooks/useSearch';
import { TimeAgoCell } from 'component/common/Table/cells/TimeAgoCell/TimeAgoCell';
import { useLoginHistory } from 'hooks/api/getters/useLoginHistory/useLoginHistory';
import { LoginHistorySuccessfulCell } from './LoginHistorySuccessfulCell/LoginHistorySuccessfulCell.tsx';
import type { ILoginEvent } from 'interfaces/loginEvent';
import { useLoginHistoryApi } from 'hooks/api/actions/useLoginHistoryApi/useLoginHistoryApi';
import { formatDateYMDHMS } from 'utils/formatDate';
import { useSearchParams } from 'react-router';
import { createLocalStorage } from 'utils/createLocalStorage';
import Download from '@mui/icons-material/Download';

export type PageQueryType = Partial<
    Record<'sort' | 'order' | 'search', string>
>;

const defaultSort = { id: 'created_at', desc: true };

const { value: storedParams, setValue: setStoredParams } = createLocalStorage(
    'LoginHistoryTable:v1',
    defaultSort,
);

const AUTH_TYPE_LABEL: { [key: string]: string } = {
    simple: 'Password',
    oidc: 'OIDC',
    saml: 'SAML',
    github: 'GitHub',
};

const EVENT_TYPE_LABEL: { [key: string]: string } = {
    login: 'Login',
    logout: 'Logout',
};

export const LoginHistoryTable = () => {
    const { events, loading } = useLoginHistory();
    const { downloadCSV } = useLoginHistoryApi();

    const [searchParams, setSearchParams] = useSearchParams();
    const [initialState] = useState(() => ({
        sorting: [
            {
                id: searchParams.get('sort') || storedParams.id,
                desc: searchParams.has('order')
                    ? searchParams.get('order') === 'desc'
                    : storedParams.desc,
            },
        ],
        columnVisibility: { failure_reason: false },
        globalFilter: searchParams.get('search') || '',
    }));

    const [searchValue, setSearchValue] = useState(initialState.globalFilter);

    const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    const columns = useMemo<ColumnDef<ILoginEvent, unknown>[]>(
        () => [
            {
                id: 'created_at',
                header: 'Created',
                accessorKey: 'created_at',
                cell: ({ getValue, column }) => (
                    <TimeAgoCell
                        value={String(getValue() ?? '')}
                        column={column}
                        dateFormat={formatDateYMDHMS}
                    />
                ),
                meta: { maxWidth: 150 },
            },
            {
                id: 'type',
                header: 'Type',
                accessorFn: (event) =>
                    EVENT_TYPE_LABEL[event.type] || event.type || 'Login',
                cell: HighlightCell,
                meta: {
                    width: 100,
                    maxWidth: 100,
                    searchable: true,
                    filterName: 'type',
                },
            },
            {
                id: 'username',
                header: 'Username',
                accessorKey: 'username',
                cell: HighlightCell,
                meta: { minWidth: 100, searchable: true },
            },
            {
                id: 'auth_type',
                header: 'Authentication',
                accessorFn: (event) =>
                    AUTH_TYPE_LABEL[event.auth_type] || event.auth_type,
                cell: HighlightCell,
                meta: {
                    width: 150,
                    maxWidth: 150,
                    searchable: true,
                    filterName: 'auth',
                },
            },
            {
                id: 'ip',
                header: 'IP address',
                accessorKey: 'ip',
                cell: HighlightCell,
                meta: { width: 150, searchable: true },
            },
            {
                id: 'successful',
                header: 'Success',
                accessorKey: 'successful',
                cell: LoginHistorySuccessfulCell,
                meta: {
                    width: 100,
                    align: 'center',
                    filterName: 'success',
                    filterParsing: (value: boolean) => value.toString(),
                },
            },
            // Always hidden -- for search
            {
                id: 'failure_reason',
                header: 'Failure Reason',
                accessorKey: 'failure_reason',
                meta: { searchable: true },
            },
        ],
        [],
    );

    const { data, getSearchText, getSearchContext } = useSearch(
        columns,
        searchValue,
        events,
    );

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
        enableMultiSort: false,
    });

    useConditionallyHiddenColumns(
        [
            {
                condition: isExtraSmallScreen,
                columns: ['role', 'seenAt'],
            },
            {
                condition: isSmallScreen,
                columns: ['imageUrl', 'tokens', 'createdAt'],
            },
        ],
        table.setColumnVisibility,
        columns,
    );

    const sorting = table.getState().sorting;

    useEffect(() => {
        const sortRule = sorting[0];
        if (!sortRule) {
            return;
        }
        const tableState: PageQueryType = {};
        tableState.sort = sortRule.id;
        if (sortRule.desc) {
            tableState.order = 'desc';
        }
        if (searchValue) {
            tableState.search = searchValue;
        }

        setSearchParams(tableState, {
            replace: true,
        });
        setStoredParams({
            id: sortRule.id,
            desc: sortRule.desc || false,
        });
    }, [sorting, searchValue, setSearchParams]);

    const rowCount = table.getRowModel().rows.length;

    return (
        <PageContent
            isLoading={loading}
            header={
                <PageHeader
                    title={`Login history (${rowCount})`}
                    actions={
                        <>
                            <ConditionallyRender
                                condition={!isSmallScreen}
                                show={
                                    <Search
                                        initialValue={searchValue}
                                        onChange={setSearchValue}
                                        hasFilters
                                        getSearchContext={getSearchContext}
                                    />
                                }
                            />
                            <ConditionallyRender
                                condition={rowCount > 0}
                                show={
                                    <>
                                        <ConditionallyRender
                                            condition={!isSmallScreen}
                                            show={<PageHeader.Divider />}
                                        />
                                        <Tooltip
                                            title='Download login history'
                                            arrow
                                        >
                                            <IconButton onClick={downloadCSV}>
                                                <Download />
                                            </IconButton>
                                        </Tooltip>
                                    </>
                                }
                            />
                        </>
                    }
                >
                    <ConditionallyRender
                        condition={isSmallScreen}
                        show={
                            <Search
                                initialValue={searchValue}
                                onChange={setSearchValue}
                                hasFilters
                                getSearchContext={getSearchContext}
                            />
                        }
                    />
                </PageHeader>
            }
        >
            <SearchHighlightProvider value={getSearchText(searchValue)}>
                <VirtualizedTable tableInstance={table} />
            </SearchHighlightProvider>
            <ConditionallyRender
                condition={rowCount === 0}
                show={
                    <ConditionallyRender
                        condition={searchValue?.length > 0}
                        show={
                            <TablePlaceholder>
                                No login events found matching &ldquo;
                                {searchValue}
                                &rdquo;
                            </TablePlaceholder>
                        }
                        elseShow={
                            <TablePlaceholder>
                                No login events available.
                            </TablePlaceholder>
                        }
                    />
                }
            />
        </PageContent>
    );
};
