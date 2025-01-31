import { type OnMoveItem, useDragItem } from 'hooks/useDragItem';
import type { Row } from 'react-table';
import { styled, TableRow } from '@mui/material';
import { TableCell } from 'component/common/Table';
import { useSearchHighlightContext } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { UPDATE_ENVIRONMENT } from 'component/providers/AccessProvider/permissions';
import AccessContext from 'contexts/AccessContext';
import { type ForwardedRef, useContext, useRef } from 'react';

const StyledTableRow = styled(TableRow)(() => ({
    '&:hover': {
        '.drag-handle .drag-icon': {
            display: 'inherit',
            cursor: 'grab',
        },
    },
}));

interface IEnvironmentRowProps {
    row: Row;
    onMoveItem: OnMoveItem;
}

export const EnvironmentRow = ({ row, onMoveItem }: IEnvironmentRowProps) => {
    const { hasAccess } = useContext(AccessContext);
    const dragHandleRef = useRef(null);
    const { searchQuery } = useSearchHighlightContext();
    const draggable = !searchQuery && hasAccess(UPDATE_ENVIRONMENT);

    const dragItemRef = useDragItem<HTMLTableRowElement>(
        row.index,
        onMoveItem,
        dragHandleRef,
    );

    const renderCell = (cell: any, ref: ForwardedRef<HTMLElement>) => {
        const { key, ...cellProps } = cell.getCellProps();
        if (draggable && cell.column.isDragHandle) {
            return (
                <TableCell
                    key={key}
                    {...cellProps}
                    ref={ref}
                    className='drag-handle'
                >
                    {cell.render('Cell')}
                </TableCell>
            );
        } else {
            return (
                <TableCell key={key} {...cellProps}>
                    {cell.render('Cell')}
                </TableCell>
            );
        }
    };

    return (
        <StyledTableRow hover ref={draggable ? dragItemRef : undefined}>
            {row.cells.map((cell: any) => renderCell(cell, dragHandleRef))}
        </StyledTableRow>
    );
};
