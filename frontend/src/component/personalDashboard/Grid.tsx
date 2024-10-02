import { Box, Grid, styled } from '@mui/material';
import type { Theme } from '@mui/material/styles/createTheme';

export const ContentGrid = styled(Grid)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    borderRadius: `${theme.shape.borderRadiusLarge}px`,
}));

export const SpacedGridItem = styled(Grid)(({ theme }) => ({
    padding: theme.spacing(4),
    border: `0.5px solid ${theme.palette.divider}`,
}));

export const ListItemBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
    alignItems: 'center',
    width: '100%',
}));

export const listItemStyle = (theme: Theme) => ({
    borderRadius: theme.spacing(0.5),
    borderLeft: `${theme.spacing(0.5)} solid transparent`,
    '&.Mui-selected': {
        borderLeft: `${theme.spacing(0.5)} solid ${theme.palette.primary.main}`,
    },
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(1),
});
