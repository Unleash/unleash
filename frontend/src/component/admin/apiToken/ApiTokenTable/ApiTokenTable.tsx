import { useApiTokens } from 'hooks/api/getters/useApiTokens/useApiTokens';
import { useTable, useGlobalFilter, useSortBy } from 'react-table';
import { PageContent } from 'component/common/PageContent/PageContent';
import {
    SortableTableHeader,
    TableCell,
    TablePlaceholder,
} from 'component/common/Table';
import { Table, TableBody, Box, TableRow, useMediaQuery } from '@mui/material';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { ApiTokenDocs } from 'component/admin/apiToken/ApiTokenDocs/ApiTokenDocs';
import { CreateApiTokenButton } from 'component/admin/apiToken/CreateApiTokenButton/CreateApiTokenButton';
import { IconCell } from 'component/common/Table/cells/IconCell/IconCell';
import { Key } from '@mui/icons-material';
import { ActionCell } from 'component/common/Table/cells/ActionCell/ActionCell';
import { CopyApiTokenButton } from 'component/admin/apiToken/CopyApiTokenButton/CopyApiTokenButton';
import { RemoveApiTokenButton } from 'component/admin/apiToken/RemoveApiTokenButton/RemoveApiTokenButton';
import { DateCell } from 'component/common/Table/cells/DateCell/DateCell';
import { sortTypes } from 'utils/sortTypes';
import { useMemo } from 'react';
import theme from 'themes/theme';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { ProjectsList } from 'component/admin/apiToken/ProjectsList/ProjectsList';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';
import { Search } from 'component/common/Search/Search';
import useHiddenColumns from 'hooks/useHiddenColumns';

const hiddenColumnsSmall = ['Icon', 'createdAt'];
const hiddenColumnsFlagE = ['projects', 'environment'];

export const ApiTokenTable = () => {
    const { tokens, loading } = useApiTokens();
    const initialState = useMemo(() => ({ sortBy: [{ id: 'createdAt' }] }), []);
    const { uiConfig } = useUiConfig();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        state: { globalFilter },
        setGlobalFilter,
        setHiddenColumns,
    } = useTable(
        {
            columns: COLUMNS as any,
            data: tokens as any,
            initialState,
            sortTypes,
            disableSortRemove: true,
        },
        useGlobalFilter,
        useSortBy
    );

    useHiddenColumns(setHiddenColumns, hiddenColumnsSmall, isSmallScreen);
    useHiddenColumns(setHiddenColumns, hiddenColumnsFlagE, !uiConfig.flags.E);

    return (
        <PageContent
            header={
                <PageHeader
                    title={`API access (${rows.length})`}
                    actions={
                        <>
                            <Search
                                initialValue={globalFilter}
                                onChange={setGlobalFilter}
                            />
                            <PageHeader.Divider />
                            <CreateApiTokenButton />
                        </>
                    }
                />
            }
        >
            <ConditionallyRender
                condition={rows.length > 0}
                show={
                    <Box sx={{ mb: 4 }}>
                        <ApiTokenDocs />
                    </Box>
                }
            />
            <Box sx={{ overflowX: 'auto' }}>
                <SearchHighlightProvider value={globalFilter}>
                    <Table {...getTableProps()}>
                        <SortableTableHeader
                            headerGroups={headerGroups as any}
                        />
                        <TableBody {...getTableBodyProps()}>
                            {rows.map(row => {
                                prepareRow(row);
                                return (
                                    <TableRow hover {...row.getRowProps()}>
                                        {row.cells.map(cell => (
                                            <TableCell {...cell.getCellProps()}>
                                                {cell.render('Cell')}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </SearchHighlightProvider>
            </Box>
            <ConditionallyRender
                condition={rows.length === 0 && !loading}
                show={
                    <ConditionallyRender
                        condition={globalFilter?.length > 0}
                        show={
                            <TablePlaceholder>
                                No tokens found matching &ldquo;
                                {globalFilter}
                                &rdquo;
                            </TablePlaceholder>
                        }
                        elseShow={
                            <TablePlaceholder>
                                <span>
                                    {'No tokens available. Read '}
                                    <a
                                        href="https://docs.getunleash.io/how-to/api"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        API How-to guides
                                    </a>{' '}
                                    {' to learn more.'}
                                </span>
                            </TablePlaceholder>
                        }
                    />
                }
            />
        </PageContent>
    );
};

const tokenDescriptions = {
    client: {
        label: 'CLIENT',
        title: 'Connect server-side SDK or Unleash Proxy',
    },
    frontend: {
        label: 'FRONTEND',
        title: 'Connect web and mobile SDK',
    },
    admin: {
        label: 'ADMIN',
        title: 'Full access for managing Unleash',
    },
};

const COLUMNS = [
    {
        id: 'Icon',
        width: '1%',
        Cell: () => <IconCell icon={<Key color="disabled" />} />,
        disableSortBy: true,
        disableGlobalFilter: true,
    },
    {
        Header: 'Username',
        accessor: 'username',
        Cell: HighlightCell,
    },
    {
        Header: 'Type',
        accessor: 'type',
        Cell: ({ value }: { value: 'admin' | 'client' | 'frontend' }) => (
            <HighlightCell
                value={tokenDescriptions[value].label}
                subtitle={tokenDescriptions[value].title}
            />
        ),
        minWidth: 280,
    },
    {
        Header: 'Project',
        accessor: 'project',
        Cell: (props: any) => (
            <ProjectsList
                project={props.row.original.project}
                projects={props.row.original.projects}
            />
        ),
        minWidth: 120,
    },
    {
        Header: 'Environment',
        accessor: 'environment',
        Cell: HighlightCell,
        minWidth: 120,
    },
    {
        Header: 'Created',
        accessor: 'createdAt',
        Cell: DateCell,
        minWidth: 150,
        disableGlobalFilter: true,
    },
    {
        Header: 'Actions',
        id: 'Actions',
        align: 'center',
        width: '1%',
        disableSortBy: true,
        disableGlobalFilter: true,
        Cell: (props: any) => (
            <ActionCell>
                <CopyApiTokenButton token={props.row.original} />
                <RemoveApiTokenButton token={props.row.original} />
            </ActionCell>
        ),
    },
];
