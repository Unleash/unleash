import { useMemo, VFC } from 'react';
import { useTheme } from '@mui/material';
import {
    SortableTableHeader,
    Table,
    TableCell,
    TableBody,
    TableRow,
} from 'component/common/Table';
import { useVirtualizedRange } from 'hooks/useVirtualizedRange';
import { useStyles } from './VirtualizedTable.styles';
import { HeaderGroup, Row } from 'react-table';

interface IVirtualizedTableProps {
    rowHeight?: number;
    headerGroups: HeaderGroup<object>[];
    rows: Row<object>[];
    prepareRow: (row: Row) => void;
}

/**
 * READ BEFORE USE
 *
 * Virtualized tables require some setup.
 * With this component all but one columns are fixed width, and one fills remaining space.
 * Add `maxWidth` to columns that will be static in width, and `minWidth` to the one that should grow.
 *
 * Remember to add `useFlexLayout` to `useTable`
 * (more at: https://react-table-v7.tanstack.com/docs/api/useFlexLayout)
 */
export const VirtualizedTable: VFC<IVirtualizedTableProps> = ({
    rowHeight: rowHeightOverride,
    headerGroups,
    rows,
    prepareRow,
}) => {
    const { classes } = useStyles();
    const theme = useTheme();
    const rowHeight = useMemo(
        () => rowHeightOverride || theme.shape.tableRowHeight,
        [rowHeightOverride, theme.shape.tableRowHeight]
    );

    const [firstRenderedIndex, lastRenderedIndex] =
        useVirtualizedRange(rowHeight);

    const tableHeight = useMemo(
        () => rowHeight * rows.length + theme.shape.tableRowHeightCompact,
        [rowHeight, rows.length, theme.shape.tableRowHeightCompact]
    );

    return (
        <Table
            role="table"
            rowHeight={rowHeight}
            style={{ height: tableHeight }}
        >
            <SortableTableHeader headerGroups={headerGroups} flex />
            <TableBody role="rowgroup">
                {rows.map((row, index) => {
                    const top =
                        index * rowHeight + theme.shape.tableRowHeightCompact;

                    const isVirtual =
                        index < firstRenderedIndex || index > lastRenderedIndex;

                    if (isVirtual) {
                        return null;
                    }

                    prepareRow(row);

                    return (
                        <TableRow
                            hover
                            {...row.getRowProps()}
                            key={row.id}
                            className={classes.row}
                            style={{ display: 'flex', top }}
                        >
                            {row.cells.map(cell => (
                                <TableCell
                                    {...cell.getCellProps({
                                        style: {
                                            flex: cell.column.minWidth
                                                ? '1 0 auto'
                                                : undefined,
                                        },
                                    })}
                                    className={classes.cell}
                                >
                                    {cell.render('Cell')}
                                </TableCell>
                            ))}
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
};
