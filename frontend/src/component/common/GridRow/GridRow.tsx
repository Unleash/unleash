import { styled, type SxProps, type Theme } from '@mui/material';
import Grid from '@mui/material/Grid';
import type React from 'react';
import type { FC } from 'react';
import { asSxArray } from 'utils/asSxArray';

const StyledGrid = styled(Grid)(({ theme }) => ({
    flexWrap: 'nowrap',
    gap: theme.spacing(1),
    width: '100%',
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
                ...asSxArray(sx),
            ]}
        >
            {children}
        </StyledGrid>
    );
};
