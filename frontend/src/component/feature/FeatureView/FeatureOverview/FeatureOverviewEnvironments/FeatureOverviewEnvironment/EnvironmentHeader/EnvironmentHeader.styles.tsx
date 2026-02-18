import { Box, styled } from '@mui/material';

export const StyledSuggestion = styled('div')(({ theme }) => ({
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0.5, 3),
    background: theme.palette.secondary.light,
    borderBottomLeftRadius: theme.shape.borderRadiusLarge,
    borderBottomRightRadius: theme.shape.borderRadiusLarge,
    color: theme.palette.primary.main,
    fontSize: theme.fontSizes.smallerBody,
}));

export const StyledBold = styled('b')(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
}));

export const StyledSpan = styled('span')(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
    textDecoration: 'underline',
}));

export const TooltipHeader = styled('div')(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
}));

export const TooltipDescription = styled('div')(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    paddingBottom: theme.spacing(1.5),
}));

export const StyledBox = styled(Box)(({ theme }) => ({
    padding: theme.spacing(1.5),
}));
