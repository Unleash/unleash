import { FC } from 'react';
import { Box } from '@mui/material';
import { useStyles } from 'component/common/Table/TablePlaceholder/TablePlaceholder.styles';

export const TablePlaceholder: FC = ({ children }) => {
    const { classes: styles } = useStyles();

    return <Box className={styles.emptyStateListItem}>{children}</Box>;
};
