import { styled, type TypographyProps } from '@mui/material';
import { Box, Card, Paper, Typography } from '@mui/material';
import { UserAvatar } from 'component/common/UserAvatar/UserAvatar';

export const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3, 4),
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

export const StyledHeader = styled(Typography)<TypographyProps>(
    ({ theme }) => ({
        display: 'flex',
        alignItems: 'center',
        marginRight: theme.spacing(1),
        fontSize: theme.fontSizes.mainHeader,
    }),
);

export const StyledCard = styled(Card)(({ theme }) => ({
    padding: theme.spacing(0.75, 1.5),
    backgroundColor: theme.palette.background.elevation2,
}));

export const StyledAvatar = styled(UserAvatar)(({ theme }) => ({
    height: '24px',
    width: '24px',
    marginInline: 0,
}));
