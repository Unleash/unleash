import { FC, VFC } from 'react';
import { Box, Toolbar, Typography } from '@mui/material';
import { useStyles } from './TableToolbar.styles';

interface ITableToolbarProps {
    title: string;
}

export const TableToolbarComponent: FC<ITableToolbarProps> & {
    Divider: VFC;
} = ({ title, children }) => {
    const { classes: styles } = useStyles();

    return (
        <Toolbar className={styles.toolbar}>
            <Typography variant="h1" data-loading>
                {title}
            </Typography>
            <Box className={styles.actions}>{children}</Box>
        </Toolbar>
    );
};

const Divider: VFC = () => {
    const { classes: styles } = useStyles();

    return <Box className={styles.verticalSeparator} />;
};

TableToolbarComponent.Divider = Divider;

export const TableToolbar = TableToolbarComponent;
