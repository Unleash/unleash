import { useMemo } from 'react';
import { useTheme } from '@mui/material';
import {
    SortableTableHeader,
    TableBody,
    TableRow,
} from 'component/common/Table';
import { useVirtualizedRange } from 'hooks/useVirtualizedRange';
import { HeaderGroup, Row } from 'react-table';
import { TableCell } from '../Table/TableCell/TableCell';
import { Table } from '../Table/Table/Table';

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
export const VirtualizedTable = <T extends object>({
    rowHeight: rowHeightOverride,
    headerGroups,
    rows,
    prepareRow,
}: {
    rowHeight?: number;
    headerGroups: HeaderGroup<T>[];
    rows: Row<T>[];
    prepareRow: (row: Row<T>) => void;
}) => {
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
            <TableBody
                role="rowgroup"
                sx={{
                    '& tr': {
                        position: 'absolute',
                        width: '100%',
                        '&:hover': {
                            '.show-row-hover': {
                                opacity: 1,
                            },
                        },
                    },
                    '& tr td': {
                        alignItems: 'center',
                        display: 'flex',
                        flexShrink: 0,
                        '& > *': {
                            flexGrow: 1,
                        },
                    },
                }}
            >
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
                            {...row.getRowProps({
                                style: { display: 'flex', top },
                            })}
                            key={row.id}
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
