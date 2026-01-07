import { TableHead, TableRow } from '@mui/material';
import type { HeaderGroup } from 'react-table';
import { CellSortable } from './CellSortable/CellSortable.tsx';

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
        {headerGroups.map((headerGroup) => {
            const { key, ...props } = headerGroup.getHeaderGroupProps();
            return (
                <TableRow key={key} {...props} data-loading>
                    {headerGroup.headers.map((column: HeaderGroup<T>) => {
                        const content = column.render('Header');

                        const { key, ...props } = column.getHeaderProps(
                            column.canSort
                                ? column.getSortByToggleProps()
                                : undefined,
                        );

                        return (
                            <CellSortable
                                // @ts-expect-error -- check after `react-table` v8
                                styles={column.styles || {}}
                                key={key}
                                {...props}
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
            );
        })}
    </TableHead>
);
