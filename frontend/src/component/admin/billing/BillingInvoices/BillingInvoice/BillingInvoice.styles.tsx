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
    margin: theme.spacing(0.5, 0),
    padding: withBackground
        ? theme.spacing(2, 2, 3)
        : theme.spacing(0.5, 2, 1.5),
    borderRadius: theme.shape.borderRadiusLarge,
    gap: theme.spacing(2),
}));

export const StyledAmountCell = styled('div')(({ theme }) => ({
    textAlign: 'right',
    paddingRight: theme.spacing(1.5),
}));

export const StyledDescriptionCell = styled('div', {
    shouldForwardProp: (prop) => prop !== 'expand',
})<{ expand?: boolean }>(({ expand }) => ({
    display: 'flex',
    flexDirection: 'column',
    gridColumn: expand ? '1 / span 2' : undefined,
}));
