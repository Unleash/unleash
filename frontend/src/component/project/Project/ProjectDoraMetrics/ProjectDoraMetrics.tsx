import { Box, Tooltip, useMediaQuery } from '@mui/material';
import { useProjectDoraMetrics } from 'hooks/api/getters/useProjectDoraMetrics/useProjectDoraMetrics';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useMemo, useState } from 'react';
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
    TablePlaceholder,
} from 'component/common/Table';
import { SortableTableHeaderV8 } from 'component/common/Table/SortableTableHeader/SortableTableHeaderV8';
import { PageContent } from 'component/common/PageContent/PageContent';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { Badge } from 'component/common/Badge/Badge';
import { useConditionallyHiddenColumnsV8 } from 'hooks/useConditionallyHiddenColumnsV8';
import theme from 'themes/theme';

type DoraFeatureRow = {
    name: string;
    timeToProduction: number;
};

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

/**
 * @Deprecated in favor of LeadTimeForChanges.tsx
 */
export const ProjectDoraMetrics = () => {
    const projectId = useRequiredPathParam('projectId');

    const { dora, loading } = useProjectDoraMetrics(projectId);
    const [globalFilter, setGlobalFilter] = useState('');

    const data = useMemo<DoraFeatureRow[]>(() => {
        if (loading) {
            return Array(5).fill({
                name: 'Featurename',
                timeToProduction: 0,
            });
        }

        return dora.features;
    }, [dora, loading]);

    const columns = useMemo<ColumnDef<DoraFeatureRow, unknown>[]>(
        () => [
            {
                id: 'name',
                header: 'Name',
                accessorKey: 'name',
                cell: ({ row: { original: { name } } }) => (
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
                ),
                sortingFn: 'alphanumeric',
                meta: { width: '40%' },
            },
            {
                id: 'timetoproduction',
                header: 'Time to production',
                cell: ({ row: { original } }) => (
                    <Tooltip
                        title='The time from the feature flag of type release was created until it was turned on in a production environment'
                        arrow
                    >
                        <Box
                            sx={{ display: 'flex', justifyContent: 'center' }}
                            data-loading
                        >
                            {original.timeToProduction} days
                        </Box>
                    </Tooltip>
                ),
                enableGlobalFilter: false,
                enableSorting: false,
                meta: { width: 200, align: 'center' },
            },
            {
                id: 'deviation',
                header: 'Deviation',
                cell: ({ row: { original } }) => (
                    <Tooltip
                        title={`Deviation from project average. Average for this project is: ${
                            dora.projectAverage || 0
                        } days`}
                        arrow
                    >
                        <Box
                            sx={{ display: 'flex', justifyContent: 'center' }}
                            data-loading
                        >
                            {Math.round(
                                (dora.projectAverage
                                    ? dora.projectAverage
                                    : 0) - original.timeToProduction,
                            )}{' '}
                            days
                        </Box>
                    </Tooltip>
                ),
                enableGlobalFilter: false,
                enableSorting: false,
                meta: { width: 300, align: 'center' },
            },
            {
                id: 'dora',
                header: 'DORA',
                cell: ({ row: { original } }) => (
                    <Tooltip
                        title='Dora score. High = less than a week to production. Medium = less than a month to production. Low = Less than 6 months to production'
                        arrow
                    >
                        <Box
                            sx={{ display: 'flex', justifyContent: 'center' }}
                            data-loading
                        >
                            {resolveDoraMetrics(original.timeToProduction)}
                        </Box>
                    </Tooltip>
                ),
                enableGlobalFilter: false,
                enableSorting: false,
                meta: { width: 200, align: 'center' },
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [JSON.stringify(dora.features), loading],
    );

    const initialState = useMemo(
        () => ({
            sorting: [{ id: 'name', desc: false }],
        }),
        [],
    );

    const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const table = useReactTable({
        columns,
        data,
        initialState,
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        autoResetAll: false,
        enableSortingRemoval: false,
    });

    useConditionallyHiddenColumnsV8(
        [
            {
                condition: isExtraSmallScreen,
                columns: ['deviation'],
            },
        ],
        table.setColumnVisibility,
        columns,
    );

    const rows = table.getRowModel().rows;

    return (
        <>
            <PageContent
                isLoading={loading}
                header={
                    <PageHeader
                        title={`Lead time for changes (per release flag)`}
                    />
                }
            >
                <Table>
                    <SortableTableHeaderV8 tableInstance={table} />
                    <TableBody>
                        {rows.map((row) => (
                            <TableRow hover key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext(),
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
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
