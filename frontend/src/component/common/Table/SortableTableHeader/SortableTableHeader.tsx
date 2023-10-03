import { TableHead, TableRow } from '@mui/material';
import { HeaderGroup } from 'react-table';
import { CellSortable } from './CellSortable/CellSortable';

export const SortableTableHeader = <T extends object>({
    headerGroups,
    className,
    flex,
}: {
    headerGroups: HeaderGroup<T>[];
    className?: string;
    flex?: boolean;
}) => (
    <TableHead className={className}>
        {headerGroups.map(headerGroup => (
            <TableRow {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column: HeaderGroup<T>) => {
                    const content = column.render('Header');

                    return (
                        <CellSortable
                            {...column.getHeaderProps(
                                column.canSort
                                    ? column.getSortByToggleProps()
                                    : undefined
                            )}
                            ariaTitle={
                                typeof content === 'string'
                                    ? content
                                    : undefined
                            }
                            isSortable={Boolean(column.canSort)}
                            isSorted={column.isSorted}
                            isDescending={column.isSortedDesc}
                            maxWidth={column.maxWidth}
                            minWidth={column.minWidth}
                            width={column.width}
                            isFlex={flex}
                            isFlexGrow={Boolean(column.minWidth)}
                            // @ts-expect-error -- check after `react-table` v8
                            align={column.align}
                        >
                            {content}
                        </CellSortable>
                    );
                })}
            </TableRow>
        ))}
    </TableHead>
);
