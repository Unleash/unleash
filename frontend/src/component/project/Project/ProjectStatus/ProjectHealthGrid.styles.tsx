import { styled } from '@mui/material';

export const HealthGridTile = (gridArea: string) =>
    styled('article')(({ theme }) => ({
        gridArea,
        backgroundColor: theme.palette.envAccordion.expanded,
        padding: theme.spacing(3),
        borderRadius: theme.shape.borderRadiusExtraLarge,
    }));
