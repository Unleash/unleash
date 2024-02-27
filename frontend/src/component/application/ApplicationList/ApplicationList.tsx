import { useMemo } from 'react';
import { Avatar, CircularProgress, Icon, Link } from '@mui/material';
import { Warning } from '@mui/icons-material';
import { styles as themeStyles } from 'component/common';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import useApplications from 'hooks/api/getters/useApplications/useApplications';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Search } from 'component/common/Search/Search';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import {
    SortableTableHeader,
    Table,
    TableBody,
    TableCell,
    TableRow,
} from 'component/common/Table';
import { useGlobalFilter, useSortBy, useTable } from 'react-table';
import { sortTypes } from 'utils/sortTypes';
import { IconCell } from 'component/common/Table/cells/IconCell/IconCell';
import { LinkCell } from 'component/common/Table/cells/LinkCell/LinkCell';
import { ApplicationUsageCell } from './ApplicationUsageCell/ApplicationUsageCell';
import { ApplicationSchema } from 'openapi';

export const ApplicationList = () => {
    const { applications: data, loading } = useApplications();

    const renderNoApplications = () => (
        <>
            <section style={{ textAlign: 'center' }}>
                <Warning titleAccess='Warning' /> <br />
                <br />
                Oh snap, it does not seem like you have connected any
                applications. To connect your application to Unleash you will
                require a Client SDK.
                <br />
                <br />
                You can read more about how to use Unleash in your application
                in the{' '}
                <Link href='https://docs.getunleash.io/docs/sdks/'>
                    documentation.
                </Link>
            </section>
        </>
    );

    const initialState = useMemo(
        () => ({
            sortBy: [{ id: 'name', desc: false }],
            hiddenColumns: ['description', 'sortOrder'],
        }),
        [],
    );

    const columns = useMemo(
        () => [
            {
                id: 'Icon',
                Cell: ({
                    row: {
                        original: { icon },
                    },
                }: any) => (
                    <IconCell
                        icon={
                            <Avatar>
                                <Icon>{icon || 'apps'}</Icon>
                            </Avatar>
                        }
                    />
                ),
                disableGlobalFilter: true,
            },
            {
                Header: 'Name',
                accessor: 'appName',
                width: '50%',
                Cell: ({
                    row: {
                        original: { appName, description },
                    },
                }: any) => (
                    <LinkCell
                        title={appName}
                        to={`/applications/${appName}`}
                        subtitle={description}
                    />
                ),
                sortType: 'alphanumeric',
            },
            {
                Header: 'Project(environment)',
                accessor: 'usage',
                width: '50%',
                Cell: ({
                    row: { original },
                }: {
                    row: { original: ApplicationSchema };
                }) => <ApplicationUsageCell usage={original.usage} />,
                sortType: 'alphanumeric',
            },
            {
                accessor: 'description',
                disableSortBy: true,
            },
            {
                accessor: 'sortOrder',
                disableGlobalFilter: true,
                sortType: 'number',
            },
        ],
        [],
    );

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        state: { globalFilter },
        setGlobalFilter,
    } = useTable(
        {
            columns: columns as any[], // TODO: fix after `react-table` v8 update
            data,
            initialState,
            sortTypes,
            autoResetGlobalFilter: false,
            autoResetSortBy: false,
            disableSortRemove: true,
        },
        useGlobalFilter,
        useSortBy,
    );

    if (!data) {
        return <CircularProgress variant='indeterminate' />;
    }

    return (
        <>
            <PageContent
                header={
                    <PageHeader
                        title={`Applications (${rows.length})`}
                        actions={
                            <Search
                                initialValue={globalFilter}
                                onChange={setGlobalFilter}
                            />
                        }
                    />
                }
            >
                <div className={themeStyles.fullwidth}>
                    <ConditionallyRender
                        condition={data.length > 0}
                        show={
                            <SearchHighlightProvider value={globalFilter}>
                                <Table {...getTableProps()}>
                                    <SortableTableHeader
                                        headerGroups={headerGroups}
                                    />
                                    <TableBody {...getTableBodyProps()}>
                                        {rows.map((row) => {
                                            prepareRow(row);
                                            return (
                                                <TableRow
                                                    hover
                                                    {...row.getRowProps()}
                                                >
                                                    {row.cells.map((cell) => (
                                                        <TableCell
                                                            {...cell.getCellProps()}
                                                        >
                                                            {cell.render(
                                                                'Cell',
                                                            )}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </SearchHighlightProvider>
                        }
                        elseShow={
                            <ConditionallyRender
                                condition={loading}
                                show={<div>...loading</div>}
                                elseShow={renderNoApplications()}
                            />
                        }
                    />
                </div>
            </PageContent>
        </>
    );
};
