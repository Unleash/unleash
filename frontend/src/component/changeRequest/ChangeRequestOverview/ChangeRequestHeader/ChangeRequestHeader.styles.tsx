import { styled } from '@mui/material';
import { Avatar, Box, Card, Paper, Typography } from '@mui/material';

export const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2, 4),
    borderRadius: `${theme.shape.borderRadiusLarge}px`,
}));

export const StyledContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
}));

export const StyledInnerContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
}));

export const StyledHeader = styled(Typography)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    marginRight: theme.spacing(1),
    fontSize: theme.fontSizes.mainHeader,
}));

export const StyledCard = styled(Card)(({ theme }) => ({
    padding: theme.spacing(0.5, 1),
    backgroundColor: theme.palette.tertiary.light,
}));

export const StyledAvatar = styled(Avatar)(({ theme }) => ({
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    height: '30px',
    width: '30px',
}));
