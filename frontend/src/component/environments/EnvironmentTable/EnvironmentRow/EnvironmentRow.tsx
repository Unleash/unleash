import { type OnMoveItem, useDragItem } from 'hooks/useDragItem';
import { flexRender, type Row } from '@tanstack/react-table';
import { styled, TableRow } from '@mui/material';
import { TableCell } from 'component/common/Table';
import { useSearchHighlightContext } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { UPDATE_ENVIRONMENT } from 'component/providers/AccessProvider/permissions';
import AccessContext from 'contexts/AccessContext';
import { type ForwardedRef, useContext, useRef } from 'react';
import type { IEnvironment } from 'interfaces/environments';

const StyledTableRow = styled(TableRow)(() => ({
    '&:hover': {
        '.drag-handle .drag-icon': {
            display: 'inherit',
            cursor: 'grab',
        },
    },
}));

interface IEnvironmentRowProps {
    row: Row<IEnvironment>;
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

    const renderCell = (
        cell: Row<IEnvironment>['_getAllVisibleCells'] extends () => infer T
            ? T extends Array<infer U>
                ? U
                : never
            : never,
        ref: ForwardedRef<HTMLElement>,
    ) => {
        const isDragHandle = cell.column.columnDef.meta?.isDragHandle;
        const content = flexRender(
            cell.column.columnDef.cell,
            cell.getContext(),
        );
        if (draggable && isDragHandle) {
            return (
                <TableCell
                    key={cell.id}
                    ref={ref as ForwardedRef<HTMLTableCellElement>}
                    className='drag-handle'
                >
                    {content}
                </TableCell>
            );
        }
        return <TableCell key={cell.id}>{content}</TableCell>;
    };

    return (
        <StyledTableRow hover ref={draggable ? dragItemRef : undefined}>
            {row.getVisibleCells().map((cell) => renderCell(cell, dragHandleRef))}
        </StyledTableRow>
    );
};
