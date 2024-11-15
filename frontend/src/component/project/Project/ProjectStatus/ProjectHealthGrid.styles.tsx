import { styled } from '@mui/material';

export const HealthGridTile = styled('article')(({ theme }) => ({
    backgroundColor: theme.palette.neutral.light,
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadiusExtraLarge,
}));
