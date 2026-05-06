import { TableHead, TableRow } from '@mui/material';
import { flexRender, type Table as TableType } from '@tanstack/react-table';
import { CellSortable } from './CellSortable/CellSortable.tsx';

export const SortableTableHeaderV8 = <T,>({
    tableInstance,
    className,
    flex,
}: {
    tableInstance: TableType<T>;
    className?: string;
    flex?: boolean;
}) => (
    <TableHead className={className}>
        {tableInstance.getHeaderGroups().map((headerGroup) => (
            <TableRow
                key={headerGroup.id}
                data-loading
                style={flex ? { display: 'flex' } : undefined}
            >
                {headerGroup.headers.map((header) => {
                    const column = header.column;
                    const meta = column.columnDef.meta;
                    const sortDirection = column.getIsSorted();
                    const headerDef = column.columnDef.header;
                    const content = header.isPlaceholder
                        ? null
                        : flexRender(headerDef, header.getContext());

                    return (
                        <CellSortable
                            key={header.id}
                            styles={meta?.styles ?? {}}
                            ariaTitle={
                                typeof headerDef === 'string'
                                    ? headerDef
                                    : undefined
                            }
                            isSortable={column.getCanSort()}
                            isSorted={sortDirection !== false}
                            isDescending={sortDirection === 'desc'}
                            onClick={
                                column.getCanSort()
                                    ? () => column.toggleSorting()
                                    : undefined
                            }
                            maxWidth={meta?.maxWidth}
                            minWidth={meta?.minWidth}
                            width={
                                meta?.width ?? meta?.maxWidth ?? meta?.minWidth
                            }
                            isFlex={flex}
                            isFlexGrow={Boolean(meta?.minWidth)}
                            align={meta?.align}
                        >
                            {content}
                        </CellSortable>
                    );
                })}
            </TableRow>
        ))}
    </TableHead>
);
