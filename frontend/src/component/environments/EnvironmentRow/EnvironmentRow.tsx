import { useDragItem, MoveListItem } from 'hooks/useDragItem';
import { Row } from 'react-table';
import { TableRow } from '@mui/material';
import { TableCell } from 'component/common/Table';
import { useSearchHighlightContext } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';

interface IEnvironmentRowProps {
    row: Row;
    moveListItem: MoveListItem;
}

export const EnvironmentRow = ({ row, moveListItem }: IEnvironmentRowProps) => {
    const dragItemRef = useDragItem(row.index, moveListItem);
    const { searchQuery } = useSearchHighlightContext();
    const draggable = !searchQuery;

    return (
        <TableRow hover ref={draggable ? dragItemRef : undefined}>
            {row.cells.map((cell: any) => (
                <TableCell {...cell.getCellProps()}>
                    {cell.render('Cell')}
                </TableCell>
            ))}
        </TableRow>
    );
};
