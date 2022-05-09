import { forwardRef } from 'react';
import { Paper, PaperProps } from '@mui/material';
import { useStyles } from './TableContainer.styles';

/**
 * @deprecated
 */
export const TableContainer = forwardRef<HTMLDivElement, PaperProps>(
    ({ children, ...props }, ref) => {
        const { classes } = useStyles();

        return (
            <Paper ref={ref} className={classes.panel} {...props}>
                {children}
            </Paper>
        );
    }
);
