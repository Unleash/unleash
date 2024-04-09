import { styled } from '@mui/material';

export const StyledContainer = styled('div')(({ theme }) => ({
    display: 'inline-block',
    wordBreak: 'break-word',
    padding: theme.spacing(0.5, 1),
    background: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,

    '&:hover': {
        border: `1px solid ${theme.palette.primary.main}`,
    },
}));

export const StyledValue = styled('div')(({ theme }) => ({
    lineHeight: 1.33,
    fontSize: theme.fontSizes.smallBody,
}));
export const StyledDescription = styled('div')(({ theme }) => ({
    lineHeight: 1.33,
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.action.active,
}));
