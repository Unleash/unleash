import { Grid } from '@mui/material';
import { FC } from 'react';

export const GridCol: FC<{ vertical?: boolean }> = ({
    children,
    vertical = false,
}) => {
    return (
        <Grid
            container={vertical}
            item
            display="flex"
            alignItems={vertical ? 'start' : 'center'}
            direction={vertical ? 'column' : undefined}
        >
            {children}
        </Grid>
    );
};
