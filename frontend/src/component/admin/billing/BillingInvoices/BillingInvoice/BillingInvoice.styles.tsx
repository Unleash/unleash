import { styled } from '@mui/material';

export const StyledSubgrid = styled('div', {
    shouldForwardProp: (prop) => prop !== 'withBackground',
})<{ withBackground?: boolean }>(({ theme, withBackground }) => ({
    display: 'grid',
    gridTemplateColumns: 'subgrid',
    gridColumn: '1 / -1',
    background: withBackground
        ? theme.palette.background.elevation1
        : 'transparent',
    margin: theme.spacing(0.25, 0),
    padding: theme.spacing(0, 2),
    borderRadius: theme.shape.borderRadiusLarge,
}));
