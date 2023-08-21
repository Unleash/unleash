import { styled } from '@mui/material';

export const StyledCardsGrid = styled('div')(({ theme }) => ({
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gridAutoRows: '1fr',
    gap: theme.spacing(2),
    display: 'grid',
}));
