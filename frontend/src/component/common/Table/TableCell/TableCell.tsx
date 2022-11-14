import { FC, ForwardedRef, forwardRef } from 'react';
import classnames from 'classnames';
import { TableCell as MUITableCell, TableCellProps } from '@mui/material';
import { useStyles } from './TableCell.styles';

export const TableCell: FC<TableCellProps> = forwardRef(
    ({ className, ...props }, ref: ForwardedRef<unknown>) => {
        const { classes: styles } = useStyles();

        return (
            <MUITableCell
                className={classnames(styles.tableCell, className)}
                {...props}
                ref={ref}
            />
        );
    }
);
