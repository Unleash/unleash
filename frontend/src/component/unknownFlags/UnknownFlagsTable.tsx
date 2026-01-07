import { useContext, useMemo, useState } from 'react';
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
import { formatDateYMDHMS } from 'utils/formatDate.js';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell.js';
import { UnknownFlagsLastEventCell } from './UnknownFlagsLastEventCell.js';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon.js';
import { UnknownFlagsActionsCell } from './UnknownFlagsActionsCell.js';
import { UnknownFlagsLastReportedCell } from './UnknownFlagsLastReportedCell.js';
import useProjects from 'hooks/api/getters/useProjects/useProjects.js';
import AccessContext from 'contexts/AccessContext.js';
import { DEFAULT_PROJECT_ID } from 'hooks/api/getters/useDefaultProject/useDefaultProjectId.js';
import { CREATE_FEATURE } from 'component/providers/AccessProvider/permissions.js';

const StyledAlert = styled(Alert)(({ theme }) => ({
    marginBottom: theme.spacing(3),
}));

const StyledAlertContent = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

const StyledHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    paddingRight: theme.spacing(0.2),
}));

export const UnknownFlagsTable = () => {
    const { unknownFlags, loading } = useUnknownFlags();

    const [searchValue, setSearchValue] = useState('');

    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    const { projects } = useProjects();
    const { hasAccess } = useContext(AccessContext);

    const suggestedProject = useMemo(() => {
        let project =
            projects.find(({ id }) => id === DEFAULT_PROJECT_ID) || projects[0];
        if (!hasAccess(CREATE_FEATURE, project?.id)) {
            for (const proj of projects) {
                if (hasAccess(CREATE_FEATURE, proj.id)) {
                    project = proj;
                    break;
                }
            }
        }
        return project;
    }, [projects, hasAccess]);

    const columns = useMemo(
        () => [
            {
                Header: 'Flag name',
                accessor: 'name',
                minWidth: 100,
                searchable: true,
            },
            {
                Header: (
                    <StyledHeader>
                        Last reported
                        <HelpIcon
                            tooltip={`Feature flags are reported when your SDK evaluates them and they don't exist in Unleash`}
                            size='16px'
                        />
                    </StyledHeader>
                ),
                accessor: 'lastSeenAt',
                Cell: UnknownFlagsLastReportedCell,
                width: 170,
            },
            {
                Header: (
                    <StyledHeader>
                        Last event
                        <HelpIcon
                            tooltip='Last event logged for this flag name, if it has ever existed in Unleash'
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
                    <UnknownFlagsLastEventCell
                        unknownFlag={unknownFlag}
                        dateFormat={formatDateYMDHMS}
                    />
                ),
                width: 150,
            },
            {
                Header: 'Actions',
                align: 'center',
                Cell: ({
                    row: { original: unknownFlag },
                }: {
                    row: { original: UnknownFlag };
                }) => (
                    <UnknownFlagsActionsCell
                        unknownFlag={unknownFlag}
                        suggestedProject={suggestedProject}
                    />
                ),
                width: 120,
                disableSortBy: true,
            },
            // Always hidden -- for search
            {
                accessor: (row: UnknownFlag) =>
                    row.reports.map(({ appName }) => appName).join('\n'),
                id: 'appNames',
                searchable: true,
            },
            {
                accessor: (row: UnknownFlag) =>
                    Array.from(
                        new Set(
                            row.reports.flatMap(({ environments }) =>
                                environments.map(
                                    ({ environment }) => environment,
                                ),
                            ),
                        ),
                    ).join('\n'),
                id: 'environments',
                searchable: true,
            },
        ],
        [suggestedProject],
    );

    const [initialState] = useState({
        sortBy: [{ id: 'name', desc: false }],
        hiddenColumns: ['appNames', 'environments'],
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
                <StyledAlertContent>
                    <div>
                        <b>
                            Clean up unknown flags to keep your code and
                            configuration in sync
                        </b>
                        <br />
                        Unknown flags are feature flags that your SDKs tried to
                        evaluate but Unleash doesn't recognize.
                    </div>

                    <div>
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
                    </div>
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
