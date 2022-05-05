import { forwardRef, ReactNode } from 'react';
import { Paper } from '@mui/material';
import { Box } from '@mui/material';
import { useStyles } from './TablePanel.styles';

export const TablePanel = forwardRef<
    HTMLDivElement,
    { children: ReactNode; header?: ReactNode }
>(({ header, children, ...props }, ref) => {
    const { classes: styles } = useStyles();

    return (
        <Paper ref={ref} className={styles.panel} {...props}>
            {header}
            <Box className={styles.content}>{children}</Box>
        </Paper>
    );
});
