import { Grid } from '@mui/material';
import type React from 'react';
import type { FC } from 'react';

export const GridCol: FC<{
    vertical?: boolean;
    children?: React.ReactNode;
}> = ({ children, vertical = false }) => {
    return (
        <Grid
            container={vertical}
            item
            display='flex'
            alignItems={vertical ? 'start' : 'center'}
            direction={vertical ? 'column' : undefined}
        >
            {children}
        </Grid>
    );
};
