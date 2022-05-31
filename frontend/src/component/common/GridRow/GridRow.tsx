import { Grid, styled, SxProps, Theme } from '@mui/material';
import { FC } from 'react';

const StyledGrid = styled(Grid)(({ theme }) => ({
    flexWrap: 'nowrap',
    gap: theme.spacing(1),
}));

export const GridRow: FC<{ sx?: SxProps<Theme> }> = ({ sx, children }) => {
    return (
        <StyledGrid
            container
            item
            justifyContent="space-between"
            alignItems="center"
            sx={sx}
        >
            {children}
        </StyledGrid>
    );
};
