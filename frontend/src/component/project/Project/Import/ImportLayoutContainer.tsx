import { styled } from '@mui/material';

export const ImportLayoutContainer = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(5, 8, 3, 8),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    flexBasis: '70%',
}));
