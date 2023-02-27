import { useMemo, useState } from 'react';
import { TablePlaceholder, VirtualizedTable } from 'component/common/Table';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { useMediaQuery } from '@mui/material';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { useFlexLayout, useSortBy, useTable } from 'react-table';
import { sortTypes } from 'utils/sortTypes';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import theme from 'themes/theme';
import { Search } from 'component/common/Search/Search';
import { useConditionallyHiddenColumns } from 'hooks/useConditionallyHiddenColumns';
import { useSearch } from 'hooks/useSearch';
import { TimeAgoCell } from 'component/common/Table/cells/TimeAgoCell/TimeAgoCell';
import { useSignOnLog } from 'hooks/api/getters/useSignOnLog/useSignOnLog';
import { SignOnLogSuccessfulCell } from './SignOnLogSuccessfulCell/SignOnLogSuccessfulCell';
import { ISignOnEvent } from 'interfaces/signOnEvent';
import { SignOnLogActionsCell } from './SignOnLogActionsCell/SignOnLogActionsCell';
import { SignOnLogDeleteDialog } from './SignOnLogDeleteDialog/SignOnLogDeleteDialog';
import { useSignOnLogApi } from 'hooks/api/actions/useSignOnLogApi/useSignOnLogApi';

export const SignOnLogTable = () => {
    const { setToastData, setToastApiError } = useToast();

    const { events, loading, refetch } = useSignOnLog();
    const { removeEvent } = useSignOnLogApi();

    const [searchValue, setSearchValue] = useState('');
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<ISignOnEvent>();

    const onDeleteConfirm = async (event: ISignOnEvent) => {
        try {
            await removeEvent(event.id);
            setToastData({
                title: `Event has been deleted`,
                type: 'success',
            });
            refetch();
            setDeleteOpen(false);
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    const columns = useMemo(
        () => [
            {
                Header: 'Created',
                accessor: 'created_at',
                Cell: ({ value }: { value: Date }) => (
                    <TimeAgoCell value={value} timestamp />
                ),
                sortType: 'date',
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
                accessor: (event: ISignOnEvent) =>
                    event.auth_type === 'simple'
                        ? 'Password'
                        : event.auth_type.toUpperCase(),
                width: 150,
                maxWidth: 150,
                Cell: HighlightCell,
                searchable: true,
            },
            {
                Header: 'IP address',
                accessor: 'ip',
                Cell: HighlightCell,
                searchable: true,
            },
            {
                Header: 'Successful',
                accessor: 'successful',
                align: 'center',
                Cell: SignOnLogSuccessfulCell,
                filterName: 'successful',
                filterParsing: (value: boolean) => value.toString(),
            },
            {
                Header: 'Actions',
                id: 'Actions',
                align: 'center',
                Cell: ({ row: { original: event } }: any) => (
                    <SignOnLogActionsCell
                        onDelete={() => {
                            setSelectedEvent(event);
                            setDeleteOpen(true);
                        }}
                    />
                ),
                width: 150,
                disableSortBy: true,
            },
            // Always hidden -- for search
            {
                accessor: 'failure_reason',
                Header: 'Failure Reason',
                searchable: true,
            },
        ],
        []
    );

    const [initialState] = useState({
        sortBy: [{ id: 'created_at' }],
        hiddenColumns: ['failure_reason'],
    });

    const { data, getSearchText, getSearchContext } = useSearch(
        columns,
        searchValue,
        events
    );

    const { headerGroups, rows, prepareRow, setHiddenColumns } = useTable(
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
        useFlexLayout
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
        columns
    );

    return (
        <PageContent
            isLoading={loading}
            header={
                <PageHeader
                    title={`Sign-on log (${rows.length})`}
                    actions={
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
                                No sign-on events found matching &ldquo;
                                {searchValue}
                                &rdquo;
                            </TablePlaceholder>
                        }
                        elseShow={
                            <TablePlaceholder>
                                No sign-on events available.
                            </TablePlaceholder>
                        }
                    />
                }
            />
            <SignOnLogDeleteDialog
                event={selectedEvent}
                open={deleteOpen}
                setOpen={setDeleteOpen}
                onConfirm={onDeleteConfirm}
            />
        </PageContent>
    );
};
