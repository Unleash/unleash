import { Grid, styled, type SxProps, type Theme } from '@mui/material';
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
            item
            justifyContent='space-between'
            alignItems='center'
            sx={sx}
        >
            {children}
        </StyledGrid>
    );
};
