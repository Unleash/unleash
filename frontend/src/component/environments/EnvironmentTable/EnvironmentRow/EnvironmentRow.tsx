import { MoveListItem, useDragItem } from 'hooks/useDragItem';
import { Row } from 'react-table';
import { styled, TableRow } from '@mui/material';
import { TableCell } from 'component/common/Table';
import { useSearchHighlightContext } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { UPDATE_ENVIRONMENT } from 'component/providers/AccessProvider/permissions';
import AccessContext from 'contexts/AccessContext';
import { ForwardedRef, useContext, useRef } from 'react';

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
    moveListItem: MoveListItem;
}

export const EnvironmentRow = ({ row, moveListItem }: IEnvironmentRowProps) => {
    const { hasAccess } = useContext(AccessContext);
    const dragHandleRef = useRef(null);
    const { searchQuery } = useSearchHighlightContext();
    const draggable = !searchQuery && hasAccess(UPDATE_ENVIRONMENT);

    const dragItemRef = useDragItem<HTMLTableRowElement>(
        row.index,
        moveListItem,
        dragHandleRef
    );

    const renderCell = (cell: any, ref: ForwardedRef<HTMLElement>) => {
        if (draggable && cell.column.isDragHandle) {
            return (
                <TableCell
                    {...cell.getCellProps()}
                    ref={ref}
                    className="drag-handle"
                >
                    {cell.render('Cell')}
                </TableCell>
            );
        } else {
            return (
                <TableCell {...cell.getCellProps()}>
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
