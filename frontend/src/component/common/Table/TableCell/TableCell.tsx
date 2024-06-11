import { type ForwardedRef, forwardRef } from 'react';
import {
    styled,
    TableCell as MUITableCell,
    type TableCellProps,
} from '@mui/material';

const StyledTableCell = styled(MUITableCell)(({ theme }) => ({
    padding: 0,
}));

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
    ({ className, ...props }, ref: ForwardedRef<HTMLTableCellElement>) => (
        <StyledTableCell {...props} ref={ref} />
    ),
);
