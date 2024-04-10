import { Box, styled, Tooltip, Typography, useMediaQuery } from '@mui/material';
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
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Badge } from 'component/common/Badge/Badge';
import { useConditionallyHiddenColumns } from 'hooks/useConditionallyHiddenColumns';
import theme from 'themes/theme';
import type { ProjectDoraMetricsSchema } from '../../../../../openapi';

const Container = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

const TableContainer = styled(Box)(({ theme }) => ({
    overflowY: 'auto',
    maxHeight: theme.spacing(45),
}));

const resolveDoraMetrics = (input: number) => {
    const ONE_MONTH = 30;
    const ONE_WEEK = 7;

    if (input >= ONE_MONTH) {
        return <Badge color='error'>Low</Badge>;
    }

    if (input <= ONE_MONTH && input >= ONE_WEEK + 1) {
        return <Badge>Medium</Badge>;
    }

    if (input <= ONE_WEEK) {
        return <Badge color='success'>High</Badge>;
    }
};

interface ILeadTimeForChangesProps {
    leadTime: ProjectDoraMetricsSchema;
    loading: boolean;
}

const loadingLeadTimeFeatures = [
    { name: 'feature1', timeToProduction: 0 },
    { name: 'feature2', timeToProduction: 0 },
    { name: 'feature3', timeToProduction: 0 },
    { name: 'feature4', timeToProduction: 0 },
    { name: 'feature5', timeToProduction: 2 },
];

export const LeadTimeForChanges = ({
    leadTime,
    loading,
}: ILeadTimeForChangesProps) => {
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
                id: 'timetoproduction',
                align: 'center',
                Cell: ({ row: { original } }: any) => (
                    <Tooltip
                        title='The time from the feature flag of type release was created until it was turned on in a production environment'
                        arrow
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                            }}
                            data-loading
                        >
                            {original.timeToProduction} days
                        </Box>
                    </Tooltip>
                ),
                width: 220,
                disableGlobalFilter: true,
                disableSortBy: true,
            },
            {
                Header: `Deviation`,
                id: 'deviation',
                align: 'center',
                Cell: ({ row: { original } }: any) => (
                    <Tooltip
                        title={`Deviation from project average. Average for this project is: ${
                            leadTime.projectAverage || 0
                        } days`}
                        arrow
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                            }}
                            data-loading
                        >
                            {Math.round(
                                (leadTime.projectAverage
                                    ? leadTime.projectAverage
                                    : 0) - original.timeToProduction,
                            )}{' '}
                            days
                        </Box>
                    </Tooltip>
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
                    <Tooltip
                        title='Dora score. High = less than a week to production. Medium = less than a month to production. Low = Less than 6 months to production'
                        arrow
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                            }}
                            data-loading
                        >
                            {resolveDoraMetrics(original.timeToProduction)}
                        </Box>
                    </Tooltip>
                ),
                width: 200,
                disableGlobalFilter: true,
                disableSortBy: true,
            },
        ],
        [JSON.stringify(leadTime.features), loading],
    );

    const initialState = useMemo(
        () => ({
            sortBy: [
                {
                    id: 'name',
                    desc: false,
                },
            ],
        }),
        [],
    );

    const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        state: { globalFilter },
        setHiddenColumns,
    } = useTable(
        {
            columns: columns as any[],
            data: loading ? loadingLeadTimeFeatures : leadTime.features,
            initialState,
            autoResetGlobalFilter: false,
            autoResetSortBy: false,
            disableSortRemove: true,
        },
        useGlobalFilter,
        useSortBy,
    );

    useConditionallyHiddenColumns(
        [
            {
                condition: isExtraSmallScreen,
                columns: ['deviation'],
            },
        ],
        setHiddenColumns,
        columns,
    );

    return (
        <Container>
            <Typography variant='h3'>
                Lead time for changes (per release flag)
            </Typography>
            <TableContainer>
                <Table {...getTableProps()}>
                    <SortableTableHeader headerGroups={headerGroups} />
                    <TableBody {...getTableBodyProps()}>
                        {rows.map((row) => {
                            prepareRow(row);
                            return (
                                <TableRow hover {...row.getRowProps()}>
                                    {row.cells.map((cell) => (
                                        <TableCell {...cell.getCellProps()}>
                                            {cell.render('Cell')}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
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
        </Container>
    );
};
