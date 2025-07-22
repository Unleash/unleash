import { useMemo, useState } from 'react';
import { TablePlaceholder, VirtualizedTable } from 'component/common/Table';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { Alert, styled, useMediaQuery } from '@mui/material';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { useFlexLayout, useSortBy, useTable } from 'react-table';
import { sortTypes } from 'utils/sortTypes';
import { Search } from 'component/common/Search/Search';
import { useSearch } from 'hooks/useSearch';
import { useUnknownFlags } from './hooks/useUnknownFlags.js';
import theme from 'themes/theme.js';
import { TimeAgoCell } from 'component/common/Table/cells/TimeAgoCell/TimeAgoCell.js';
import { formatDateYMDHMS } from 'utils/formatDate.js';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell.js';

const StyledAlert = styled(Alert)(({ theme }) => ({
    marginBottom: theme.spacing(3),
}));

const StyledUl = styled('ul')(({ theme }) => ({
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
}));

export const UnknownFlagsTable = () => {
    const { unknownFlags, loading } = useUnknownFlags();

    const [searchValue, setSearchValue] = useState('');

    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    const columns = useMemo(
        () => [
            {
                Header: 'Flag name',
                accessor: 'name',
                minWidth: 200,
                searchable: true,
            },
            {
                Header: 'Application',
                accessor: 'appName',
                searchable: true,
            },
            {
                Header: 'Environment',
                accessor: 'environment',
                searchable: true,
            },
            {
                Header: 'Last seen',
                accessor: 'seenAt',
                Cell: ({ value }: { value: Date }) => (
                    <TimeAgoCell value={value} dateFormat={formatDateYMDHMS} />
                ),
            },
        ],
        [],
    );

    const [initialState] = useState({
        sortBy: [{ id: 'name', desc: false }],
    });

    const { data, getSearchText } = useSearch(
        columns,
        searchValue,
        unknownFlags,
    );

    const { headerGroups, rows, prepareRow } = useTable(
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
                Cell: HighlightCell,
            },
        },
        useSortBy,
        useFlexLayout,
    );

    return (
        <PageContent
            isLoading={loading}
            header={
                <PageHeader
                    title={`Unknown flags (${rows.length})`}
                    actions={
                        <>
                            <ConditionallyRender
                                condition={!isSmallScreen}
                                show={
                                    <>
                                        <Search
                                            initialValue={searchValue}
                                            onChange={setSearchValue}
                                        />
                                        <PageHeader.Divider />
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
                            />
                        }
                    />
                </PageHeader>
            }
        >
            <StyledAlert severity='info'>
                <p>
                    <strong>Unknown flags</strong> are feature flags that your
                    SDKs tried to evaluate but which Unleash doesn't recognize.
                    Tracking them helps you catch typos, remove outdated flags,
                    and keep your code and configuration in sync. These can
                    include:
                </p>

                <StyledUl>
                    <li>
                        <b>Missing flags</b>: typos or flags referenced in code
                        that don't exist in Unleash.
                    </li>
                    <li>
                        <b>Invalid flags</b>: flags with malformed or unexpected
                        names, unsupported by Unleash.
                    </li>
                </StyledUl>

                <p>
                    We display up to 1,000 unknown flag reports from the last 7
                    days. Older flags are automatically pruned.
                </p>
            </StyledAlert>

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
                                No unknown flags found matching &ldquo;
                                {searchValue}
                                &rdquo;
                            </TablePlaceholder>
                        }
                        elseShow={
                            <TablePlaceholder>
                                No unknown flags reported in the last 7 days.
                            </TablePlaceholder>
                        }
                    />
                }
            />
        </PageContent>
    );
};
