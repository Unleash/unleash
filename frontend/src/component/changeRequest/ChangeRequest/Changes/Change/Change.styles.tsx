import { styled, Typography } from '@mui/material';

export const Deleted = styled(Typography)(({ theme }) => ({
    color: theme.palette.error.main,
    '::before': { content: '"- "' },
}));

export const Added = styled(Typography)(({ theme }) => ({
    '::before': { content: '"+ "' },
}));

export const Added = styled(Typography)(({ theme }) => ({
    '::before': { content: '"+ "' },
}));
