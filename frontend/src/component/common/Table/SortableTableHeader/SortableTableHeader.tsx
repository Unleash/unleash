import { VFC } from 'react';
import { styled, TableHead, TableRow } from '@mui/material';
import { HeaderGroup } from 'react-table';
import { CellSortable } from './CellSortable/CellSortable';

interface ISortableTableHeaderProps {
    headerGroups: HeaderGroup<object>[];
    className?: string;
    flex?: boolean;
}

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '& > th': {
        height: theme.shape.tableRowHeightCompact,
        border: 0,
        backgroundColor: theme.palette.tableHeaderBackground,
        color: theme.palette.tableHeaderColor,
        '&:first-of-type': {
            borderTopLeftRadius: theme.shape.borderRadiusMedium,
            borderBottomLeftRadius: theme.shape.borderRadiusMedium,
        },
        '&:last-of-type': {
            borderTopRightRadius: theme.shape.borderRadiusMedium,
            borderBottomRightRadius: theme.shape.borderRadiusMedium,
        },
    },
}));

export const SortableTableHeader: VFC<ISortableTableHeaderProps> = ({
    headerGroups,
    className,
    flex,
}) => (
    <TableHead className={className}>
        {headerGroups.map(headerGroup => (
            <StyledTableRow {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column: HeaderGroup) => {
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
            </StyledTableRow>
        ))}
    </TableHead>
);
