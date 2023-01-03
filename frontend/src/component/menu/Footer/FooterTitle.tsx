import { styled } from '@mui/material';

export const FooterTitle = styled('h2')(({ theme }) => ({
    all: 'unset',
    display: 'block',
    margin: theme.spacing(2, 0),
    fontSize: '1rem',
    fontWeight: theme.fontWeight.bold,
}));
