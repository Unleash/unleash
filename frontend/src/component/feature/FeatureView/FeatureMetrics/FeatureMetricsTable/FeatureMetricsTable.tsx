import type { IFeatureMetricsRaw } from 'interfaces/featureToggle';
import { TableBody, TableRow, useMediaQuery } from '@mui/material';
import { DateTimeCell } from 'component/common/Table/cells/DateTimeCell/DateTimeCell';
import { useTable, useGlobalFilter, useSortBy } from 'react-table';
import { SortableTableHeader, TableCell, Table } from 'component/common/Table';
import { IconCell } from 'component/common/Table/cells/IconCell/IconCell';
import Assessment from '@mui/icons-material/Assessment';
import { useMemo } from 'react';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import theme from 'themes/theme';
import { useConditionallyHiddenColumns } from 'hooks/useConditionallyHiddenColumns';
import { ApplicationsCell } from './ApplicationsCell.tsx';

interface IFeatureMetricsTableProps {
    metrics: IFeatureMetricsRaw[];
    tableSectionId?: string;
}

export const FeatureMetricsTable = ({
    metrics,
    tableSectionId,
}: IFeatureMetricsTableProps) => {
    const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));

    const initialState = useMemo(() => ({ sortBy: [{ id: 'timestamp' }] }), []);

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        setHiddenColumns,
    } = useTable(
        {
            initialState,
            columns: COLUMNS as any,
            data: metrics as any,
            autoResetHiddenColumns: false,
            disableSortRemove: true,
            defaultColumn: { Cell: TextCell },
        },
        useGlobalFilter,
        useSortBy,
    );

    useConditionallyHiddenColumns(
        [
            {
                condition: isMediumScreen,
                columns: ['appName', 'environment'],
            },
        ],
        setHiddenColumns,
        COLUMNS,
    );

    if (metrics.length === 0) {
        return null;
    }

    return (
        <Table {...getTableProps()} rowHeight='standard' id={tableSectionId}>
            <SortableTableHeader headerGroups={headerGroups} />
            <TableBody {...getTableBodyProps()}>
                {rows.map((row) => {
                    prepareRow(row);
                    const { key, ...rowProps } = row.getRowProps();
                    return (
                        <TableRow hover key={key} {...rowProps}>
                            {row.cells.map((cell) => {
                                const { key, ...cellProps } =
                                    cell.getCellProps();
                                return (
                                    <TableCell key={key} {...cellProps}>
                                        {cell.render('Cell')}
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
};

const COLUMNS = [
    {
        id: 'Icon',
        width: '1%',
        disableSortBy: true,
        Cell: () => <IconCell icon={<Assessment color='disabled' />} />,
    },
    {
        Header: 'Time',
        accessor: 'timestamp',
        Cell: (props: any) => (
            <DateTimeCell
                value={props.row.original.timestamp}
                timeZone={
                    props.row.original.timestamp.includes('23:59')
                        ? 'UTC'
                        : undefined
                }
            />
        ),
    },
    {
        Header: 'Application',
        accessor: 'appName',
        Cell: ApplicationsCell,
    },
    {
        Header: 'Environment',
        accessor: 'environment',
    },
    {
        id: 'requested',
        Header: 'Requested',
        accessor: (original: any) => original.yes + original.no,
    },
    {
        Header: 'Exposed',
        accessor: 'yes',
    },
];
