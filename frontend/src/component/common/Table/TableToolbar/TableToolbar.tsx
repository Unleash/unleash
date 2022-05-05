import { FC } from 'react';
import { Toolbar, Typography } from '@mui/material';
import { useStyles } from './TableToolbar.styles';

interface ITableToolbarProps {
    title: string;
}

export const TableToolbar: FC<ITableToolbarProps> = ({ title, children }) => {
    const { classes: styles } = useStyles();

    return (
        <Toolbar className={styles.root}>
            <Typography variant="h1" component="h1" data-loading>
                {title}
            </Typography>
            {children}
        </Toolbar>
    );
};
