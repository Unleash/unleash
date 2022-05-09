import { FC, VFC } from 'react';
import { Divider, Box, Toolbar } from '@mui/material';
import { useStyles } from './TableToolbar.styles';
import { HeaderTitle } from 'component/common/HeaderTitle/HeaderTitle';

interface ITableToolbarProps {
    title: string;
}

export const TableToolbarComponent: FC<ITableToolbarProps> & {
    Divider: VFC;
} = ({ title, children }) => {
    const { classes: styles } = useStyles();

    return (
        <Toolbar className={styles.toolbar}>
            <HeaderTitle title={title} data-loading />
            <Box className={styles.actions}>{children}</Box>
        </Toolbar>
    );
};

const ToolbarDivider: VFC = () => {
    const { classes: styles } = useStyles();

    return (
        <Divider
            orientation="vertical"
            variant="middle"
            className={styles.verticalSeparator}
        />
    );
};

TableToolbarComponent.Divider = ToolbarDivider;

export const TableToolbar = TableToolbarComponent;
