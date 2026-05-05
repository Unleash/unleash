import { styled, type SxProps, type Theme } from '@mui/material';
import Grid from '@mui/material/Grid';
import type React from 'react';
import type { FC } from 'react';

const StyledGrid = styled(Grid)(({ theme }) => ({
    flexWrap: 'nowrap',
    gap: theme.spacing(1),
}));

export const GridRow: FC<{
    sx?: SxProps<Theme>;
    children?: React.ReactNode;
}> = ({ sx, children }) => {
    return (
        <StyledGrid
            container
            sx={[
                { justifyContent: 'space-between', alignItems: 'center' },
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
        >
            {children}
        </StyledGrid>
    );
};
