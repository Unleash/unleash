import { Box, styled } from '@mui/material';

export const StyledBoxSummary = styled(Box)(({ theme }) => ({
    width: 'auto',
    height: 'auto',
    padding: theme.spacing(2, 3),
    borderRadius: theme.shape.borderRadiusMedium,
    border: `1px solid ${theme.palette.divider}`,
}));
