import { useEffect, useMemo, useState } from 'react';
import { TablePlaceholder, VirtualizedTable } from 'component/common/Table';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { IconButton, Tooltip, useMediaQuery } from '@mui/material';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import {
    type SortingRule,
    useFlexLayout,
    useSortBy,
    useTable,
} from 'react-table';
import { sortTypes } from 'utils/sortTypes';
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
import { useSearchParams } from 'react-router-dom';
import { createLocalStorage } from 'utils/createLocalStorage';
import Download from '@mui/icons-material/Download';

export type PageQueryType = Partial<
    Record<'sort' | 'order' | 'search', string>
>;

const defaultSort: SortingRule<string> = { id: 'created_at', desc: true };

const { value: storedParams, setValue: setStoredParams } = createLocalStorage(
    'LoginHistoryTable:v1',
    defaultSort,
);

const AUTH_TYPE_LABEL: { [key: string]: string } = {
    simple: 'Password',
    oidc: 'OIDC',
    saml: 'SAML',
    google: 'Google',
    github: 'GitHub',
};

export const LoginHistoryTable = () => {
    const { events, loading } = useLoginHistory();
    const { downloadCSV } = useLoginHistoryApi();

    const [searchParams, setSearchParams] = useSearchParams();
    const [initialState] = useState(() => ({
        sortBy: [
            {
                id: searchParams.get('sort') || storedParams.id,
                desc: searchParams.has('order')
                    ? searchParams.get('order') === 'desc'
                    : storedParams.desc,
            },
        ],
        hiddenColumns: ['failure_reason'],
        globalFilter: searchParams.get('search') || '',
    }));

    const [searchValue, setSearchValue] = useState(initialState.globalFilter);

    const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    const columns = useMemo(
        () => [
            {
                Header: 'Created',
                accessor: 'created_at',
                Cell: ({ value, column }) => (
                    <TimeAgoCell
                        value={value}
                        column={column}
                        dateFormat={formatDateYMDHMS}
                    />
                ),
                maxWidth: 150,
            },
            {
                Header: 'Username',
                accessor: 'username',
                minWidth: 100,
                Cell: HighlightCell,
                searchable: true,
            },
            {
                Header: 'Authentication',
                accessor: (event: ILoginEvent) =>
                    AUTH_TYPE_LABEL[event.auth_type] || event.auth_type,
                width: 150,
                maxWidth: 150,
                Cell: HighlightCell,
                searchable: true,
                filterName: 'auth',
            },
            {
                Header: 'IP address',
                accessor: 'ip',
                Cell: HighlightCell,
                searchable: true,
            },
            {
                Header: 'Success',
                accessor: 'successful',
                align: 'center',
                Cell: LoginHistorySuccessfulCell,
                filterName: 'success',
                filterParsing: (value: boolean) => value.toString(),
            },
            // Always hidden -- for search
            {
                accessor: 'failure_reason',
                Header: 'Failure Reason',
                searchable: true,
            },
        ],
        [],
    );

    const { data, getSearchText, getSearchContext } = useSearch(
        columns,
        searchValue,
        events,
    );

    const {
        headerGroups,
        rows,
        prepareRow,
        state: { sortBy },
        setHiddenColumns,
    } = useTable(
        {
            columns: columns as any,
            data,
            initialState,
            sortTypes,
            autoResetHiddenColumns: false,
            autoResetSortBy: false,
            disableSortRemove: true,
            disableMultiSort: true,
            defaultColumn: {
                Cell: TextCell,
            },
        },
        useSortBy,
        useFlexLayout,
    );

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
        setHiddenColumns,
        columns,
    );

    useEffect(() => {
        const tableState: PageQueryType = {};
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
        setStoredParams({
            id: sortBy[0].id,
            desc: sortBy[0].desc || false,
        });
    }, [sortBy, searchValue, setSearchParams]);

    return (
        <PageContent
            isLoading={loading}
            header={
                <PageHeader
                    title={`Login history (${rows.length})`}
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
                                condition={rows.length > 0}
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
                <VirtualizedTable
                    rows={rows}
                    headerGroups={headerGroups}
                    prepareRow={prepareRow}
                />
            </SearchHighlightProvider>
            <ConditionallyRender
                condition={rows.length === 0}
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
