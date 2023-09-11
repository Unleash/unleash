import { Box } from '@mui/material';
import { useProjectDoraMetrics } from 'hooks/api/getters/useProjectDoraMetrics/useProjectDoraMetrics';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useMemo } from 'react';
import { useTable, useGlobalFilter, useSortBy } from 'react-table';
import {
    Table,
    SortableTableHeader,
    TableBody,
    TableCell,
    TableRow,
    TablePlaceholder,
} from 'component/common/Table';
import { PageContent } from 'component/common/PageContent/PageContent';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { Badge } from 'component/common/Badge/Badge';
import { ProjectDoraFeedback } from './ProjectDoraFeedback/ProjectDoraFeedback';

const resolveDoraMetrics = (input: number) => {
    const ONE_MONTH = 30;
    const ONE_WEEK = 7;

    if (input >= ONE_MONTH) {
        return <Badge color="error">Low</Badge>;
    }

    if (input <= ONE_MONTH && input >= ONE_WEEK + 1) {
        return <Badge>Medium</Badge>;
    }

    if (input <= ONE_WEEK) {
        return <Badge color="success">High</Badge>;
    }
};

export const ProjectDoraMetrics = () => {
    const projectId = useRequiredPathParam('projectId');

    const { dora, loading } = useProjectDoraMetrics(projectId);

    const data = useMemo(() => {
        if (loading) {
            return Array(5).fill({
                name: 'Featurename',
                timeToProduction: 'Data for production',
            });
        }

        return dora.features;
    }, [dora, loading]);

    const columns = useMemo(
        () => [
            {
                Header: 'Name',
                accessor: 'name',
                width: '40%',
                Cell: ({
                    row: {
                        original: { name },
                    },
                }: any) => {
                    return (
                        <Box
                            data-loading
                            sx={{
                                pl: 2,
                                pr: 1,
                                paddingTop: 2,
                                paddingBottom: 2,
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            {name}
                        </Box>
                    );
                },
                sortType: 'alphanumeric',
            },
            {
                Header: 'Time to production',
                id: 'Time to production',
                align: 'center',
                Cell: ({ row: { original } }: any) => (
                    <Box
                        sx={{ display: 'flex', justifyContent: 'center' }}
                        data-loading
                    >
                        {original.timeToProduction} days
                    </Box>
                ),
                width: 200,
                disableGlobalFilter: true,
                disableSortBy: true,
            },
            {
                Header: `Deviation`,
                id: 'Deviation from average',
                align: 'center',
                Cell: ({ row: { original } }: any) => (
                    <Box
                        sx={{ display: 'flex', justifyContent: 'center' }}
                        data-loading
                    >
                        {dora.projectAverage - original.timeToProduction} days
                    </Box>
                ),
                width: 300,
                disableGlobalFilter: true,
                disableSortBy: true,
            },
            {
                Header: 'DORA',
                id: 'dora',
                align: 'center',
                Cell: ({ row: { original } }: any) => (
                    <Box
                        sx={{ display: 'flex', justifyContent: 'center' }}
                        data-loading
                    >
                        {resolveDoraMetrics(original.timeToProduction)}
                    </Box>
                ),
                width: 200,
                disableGlobalFilter: true,
                disableSortBy: true,
            },
        ],
        [JSON.stringify(dora.features), loading]
    );

    const initialState = useMemo(
        () => ({
            sortBy: [{ id: 'name', desc: false }],
            hiddenColumns: ['description'],
        }),
        []
    );

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        state: { globalFilter },
    } = useTable(
        {
            columns: columns as any[], // TODO: fix after `react-table` v8 update
            data,
            initialState,
            autoResetGlobalFilter: false,
            autoResetSortBy: false,
            disableSortRemove: true,
        },
        useGlobalFilter,
        useSortBy
    );

    return (
        <>
            <ProjectDoraFeedback />
            <PageContent
                isLoading={loading}
                header={
                    <PageHeader
                        title={`Lead time for changes (per release toggle)`}
                    />
                }
            >
                <Table {...getTableProps()}>
                    <SortableTableHeader headerGroups={headerGroups} />
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
                <ConditionallyRender
                    condition={rows.length === 0}
                    show={
                        <ConditionallyRender
                            condition={globalFilter?.length > 0}
                            show={
                                <TablePlaceholder>
                                    No features with data found &ldquo;
                                    {globalFilter}
                                    &rdquo;
                                </TablePlaceholder>
                            }
                        />
                    }
                />
            </PageContent>
        </>
    );
};
