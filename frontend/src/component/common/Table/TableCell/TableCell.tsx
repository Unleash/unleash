import { FC, ForwardedRef, forwardRef } from 'react';
import {
    styled,
    TableCell as MUITableCell,
    TableCellProps,
} from '@mui/material';

const StyledTableCell = styled(MUITableCell)(({ theme }) => ({
    padding: 0,
}));

export const TableCell: FC<TableCellProps> = forwardRef(
    ({ className, ...props }, ref: ForwardedRef<unknown>) => (
        <StyledTableCell {...props} ref={ref} />
    )
);
