import { useContext, useMemo, useState } from 'react';
import { TablePlaceholder } from 'component/common/Table';
import { VirtualizedTable } from 'component/common/Table/VirtualizedTable/VirtualizedTable';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { Alert, styled, useMediaQuery } from '@mui/material';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import {
    type ColumnDef,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
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

    const columns = useMemo<ColumnDef<UnknownFlag, unknown>[]>(
        () => [
            {
                id: 'name',
                header: 'Flag name',
                accessorKey: 'name',
                meta: { minWidth: 100, searchable: true },
            },
            {
                id: 'lastSeenAt',
                header: () => (
                    <StyledHeader>
                        Last reported
                        <HelpIcon
                            tooltip={`Feature flags are reported when your SDK evaluates them and they don't exist in Unleash`}
                            size='16px'
                        />
                    </StyledHeader>
                ),
                accessorKey: 'lastSeenAt',
                cell: UnknownFlagsLastReportedCell,
                meta: { width: 170 },
            },
            {
                id: 'lastEventAt',
                header: () => (
                    <StyledHeader>
                        Last event
                        <HelpIcon
                            tooltip='Last event logged for this flag name, if it has ever existed in Unleash'
                            size='16px'
                        />
                    </StyledHeader>
                ),
                accessorKey: 'lastEventAt',
                cell: ({ row: { original: unknownFlag } }) => (
                    <UnknownFlagsLastEventCell
                        unknownFlag={unknownFlag}
                        dateFormat={formatDateYMDHMS}
                    />
                ),
                meta: { width: 150 },
            },
            {
                id: 'Actions',
                header: 'Actions',
                cell: ({ row: { original: unknownFlag } }) => (
                    <UnknownFlagsActionsCell
                        unknownFlag={unknownFlag}
                        suggestedProject={suggestedProject}
                    />
                ),
                enableSorting: false,
                meta: { width: 120, align: 'center' },
            },
            // Always hidden -- for search
            {
                id: 'appNames',
                accessorFn: (row) =>
                    row.reports.map(({ appName }) => appName).join('\n'),
                meta: { searchable: true },
            },
            {
                id: 'environments',
                accessorFn: (row) =>
                    Array.from(
                        new Set(
                            row.reports.flatMap(({ environments }) =>
                                environments.map(
                                    ({ environment }) => environment,
                                ),
                            ),
                        ),
                    ).join('\n'),
                meta: { searchable: true },
            },
        ],
        [suggestedProject],
    );

    const [initialState] = useState({
        sorting: [{ id: 'name', desc: false }],
        columnVisibility: { appNames: false, environments: false },
    });

    const { data, getSearchText } = useSearch(
        columns,
        searchValue,
        unknownFlags,
    );

    const table = useReactTable({
        columns,
        data,
        initialState,
        defaultColumn: {
            cell: ({ getValue }) => (
                <HighlightCell value={String(getValue() ?? '')} />
            ),
        },
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        autoResetAll: false,
        enableSortingRemoval: false,
        enableMultiSort: false,
    });

    const rowCount = table.getRowModel().rows.length;

    return (
        <PageContent
            isLoading={loading}
            header={
                <PageHeader
                    title={`Unknown flags (${rowCount})`}
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
                <VirtualizedTable tableInstance={table} />
            </SearchHighlightProvider>
            <ConditionallyRender
                condition={rowCount === 0}
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
