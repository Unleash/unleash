import { FC } from 'react';
import { TableCell as MUITableCell, TableCellProps } from '@mui/material';
import { useStyles } from './TableCell.styles';

export const TableCell: FC<TableCellProps> = ({ ...props }) => {
    const { classes: styles } = useStyles();

    return <MUITableCell className={styles.tableCell} {...props} />;
};
