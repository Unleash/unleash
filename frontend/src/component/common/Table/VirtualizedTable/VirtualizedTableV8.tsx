import { type CSSProperties, type RefObject, useMemo } from 'react';
import { useTheme, TableBody, TableRow } from '@mui/material';
import { SortableTableHeaderV8 } from 'component/common/Table/SortableTableHeader/SortableTableHeaderV8';
import { TableCell } from 'component/common/Table/TableCell/TableCell';
import { Table } from 'component/common/Table/Table/Table';
import { useVirtualizedRange } from 'hooks/useVirtualizedRange';
import { flexRender, type Table as TableType } from '@tanstack/react-table';

/**
 * READ BEFORE USE
 *
 * Virtualized tables require some setup. With this component all but one
 * column are fixed width, and one fills remaining space. Set
 * `meta: { maxWidth }` for static columns and `meta: { minWidth }` on the
 * one that should grow. v8 has no `useFlexLayout`; layout fields live on
 * the column's `meta` (see `frontend/src/types/react-table-v8.d.ts`).
 */
export const VirtualizedTableV8 = <T,>({
    rowHeight: rowHeightOverride,
    tableInstance,
    parentRef,
}: {
    rowHeight?: number;
    tableInstance: TableType<T>;
    parentRef?: RefObject<HTMLElement | null>;
}) => {
    const theme = useTheme();
    const rowHeight = useMemo(
        () => rowHeightOverride || theme.shape.tableRowHeight,
        [rowHeightOverride, theme.shape.tableRowHeight],
    );

    const rows = tableInstance.getRowModel().rows;

    const [firstRenderedIndex, lastRenderedIndex] = useVirtualizedRange(
        rowHeight,
        40,
        5,
        parentRef?.current,
    );

    const tableHeight = useMemo(
        () => rowHeight * rows.length + theme.shape.tableRowHeightCompact,
        [rowHeight, rows.length, theme.shape.tableRowHeightCompact],
    );

    return (
        <Table
            role='table'
            rowHeight={rowHeight}
            style={{ height: tableHeight }}
        >
            <SortableTableHeaderV8 tableInstance={tableInstance} flex />
            <TableBody
                role='rowgroup'
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

                    return (
                        <TableRow
                            hover
                            key={row.id}
                            style={{ display: 'flex', top }}
                        >
                            {row.getVisibleCells().map((cell) => {
                                const meta = cell.column.columnDef.meta;
                                const cellStyle: CSSProperties = {
                                    boxSizing: 'border-box',
                                    flex: meta?.minWidth
                                        ? '1 0 auto'
                                        : undefined,
                                    minWidth: meta?.minWidth,
                                    maxWidth: meta?.maxWidth,
                                    width:
                                        meta?.width ??
                                        meta?.maxWidth ??
                                        meta?.minWidth,
                                };
                                return (
                                    <TableCell key={cell.id} style={cellStyle}>
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext(),
                                        )}
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
