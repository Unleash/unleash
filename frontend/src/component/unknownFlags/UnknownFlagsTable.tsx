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
import { type UnknownFlag, useUnknownFlags } from './hooks/useUnknownFlags.js';
import theme from 'themes/theme.js';
import { TimeAgoCell } from 'component/common/Table/cells/TimeAgoCell/TimeAgoCell.js';
import { formatDateYMDHMS } from 'utils/formatDate.js';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell.js';
import { useUiFlag } from 'hooks/useUiFlag.js';
import NotFound from 'component/common/NotFound/NotFound.js';
import { UnknownFlagsSeenInUnleashCell } from './UnknownFlagsSeenInUnleashCell.js';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon.js';

const StyledAlert = styled(Alert)(({ theme }) => ({
    marginBottom: theme.spacing(3),
}));

const StyledAlertContent = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

const StyledHeader = styled('div')({
    display: 'flex',
});

export const UnknownFlagsTable = () => {
    const { unknownFlags, loading } = useUnknownFlags();
    const unknownFlagsEnabled = useUiFlag('reportUnknownFlags');

    const [searchValue, setSearchValue] = useState('');

    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    const columns = useMemo(
        () => [
            {
                Header: 'Flag name',
                accessor: 'name',
                minWidth: 100,
                searchable: true,
            },
            {
                Header: 'Application',
                accessor: 'appName',
                searchable: true,
                minWidth: 100,
            },
            {
                Header: 'Environment',
                accessor: 'environment',
                searchable: true,
            },
            {
                Header: (
                    <StyledHeader>
                        Reported
                        <HelpIcon
                            tooltip={`Flags reported when your SDK evaluates them but they don't exist in Unleash`}
                            size='16px'
                        />
                    </StyledHeader>
                ),
                accessor: 'seenAt',
                Cell: ({ value }) => (
                    <TimeAgoCell
                        value={value}
                        title={(date) => `Reported: ${date}`}
                        dateFormat={formatDateYMDHMS}
                    />
                ),
                width: 150,
            },
            {
                Header: (
                    <StyledHeader>
                        Last event
                        <HelpIcon
                            tooltip='Events are only logged for feature flags that have been set up in Unleash first'
                            size='16px'
                        />
                    </StyledHeader>
                ),
                accessor: 'lastEventAt',
                Cell: ({
                    row: { original: unknownFlag },
                }: {
                    row: { original: UnknownFlag };
                }) => (
                    <UnknownFlagsSeenInUnleashCell
                        unknownFlag={unknownFlag}
                        dateFormat={formatDateYMDHMS}
                    />
                ),
                width: 150,
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

    if (!unknownFlagsEnabled) return <NotFound />;

    return (
        <PageContent
            isLoading={loading}
            header={
                <PageHeader
                    title={`Unknown flag report (${rows.length})`}
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
                <StyledAlertContent>
                    <p>
                        <b>
                            Clean up unknown flags to keep your code and
                            configuration in sync
                        </b>
                        <br />
                        Unknown flags are feature flags that your SDKs tried to
                        evaluate but which Unleash doesn't recognize.
                    </p>

                    <p>
                        <b>Unknown flags can include:</b>
                        <ul>
                            <li>
                                Missing flags: typos or flags referenced in code
                                that don't exist in Unleash.
                            </li>
                            <li>
                                Invalid flags: flags with malformed or
                                unexpected names, unsupported by Unleash.
                            </li>
                        </ul>
                    </p>

                    <p>
                        <b>Why do I see the same flag name multiple times?</b>
                        <br />
                        The same flag name will appear multiple times if it's
                        been seen in different applications or environments.
                    </p>
                </StyledAlertContent>
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
                                No unknown flag reports found matching &ldquo;
                                {searchValue}
                                &rdquo;
                            </TablePlaceholder>
                        }
                        elseShow={
                            <TablePlaceholder>
                                No unknown flags reported in the last 24 hours.
                            </TablePlaceholder>
                        }
                    />
                }
            />
        </PageContent>
    );
};
