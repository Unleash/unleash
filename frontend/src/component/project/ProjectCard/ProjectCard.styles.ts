import { styled } from '@mui/material';
import { Card, Box } from '@mui/material';
import { flexColumn, flexRow } from 'themes/themeStyles';

export const StyledProjectCard = styled(Card)<{ disabled?: boolean }>(
    ({ theme, disabled = false }) => ({
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        boxShadow: 'none',
        border: `1px solid ${theme.palette.divider}`,
        [theme.breakpoints.down('sm')]: {
            justifyContent: 'center',
        },
        transition: 'background-color 0.2s ease-in-out',
        backgroundColor: theme.palette.background.default,
        '&:hover': {
            backgroundColor: disabled
                ? theme.palette.background.default
                : theme.palette.action.hover,
        },
        borderRadius: theme.shape.borderRadiusMedium,
    }),
);

export const StyledProjectCardBody = styled(Box)(({ theme }) => ({
    padding: theme.spacing(1, 2, 2, 2),
    display: 'flex',
    flexFlow: 'column',
    justifyContent: 'space-between',
    height: '100%',
    position: 'relative',
    gap: theme.spacing(1),
}));

export const StyledProjectCardHeader = styled('div')(({ theme }) => ({
    gap: theme.spacing(1),
    display: 'flex',
    width: '100%',
    alignItems: 'center',
}));

export const StyledProjectCardTitleContainer = styled('div')(({ theme }) => ({
    ...flexColumn,
    margin: theme.spacing(1, 'auto', 1, 0),
}));

export const StyledProjectCardTitle = styled('h3')(({ theme }) => ({
    margin: 0,
    marginRight: 'auto',
    fontWeight: theme.typography.fontWeightBold,
    fontSize: theme.typography.body1.fontSize,
    lineHeight: '1.2',
}));

export const StyledProjectCardContent = styled('div')(({ theme }) => ({
    ...flexRow,
    justifyContent: 'space-between',
    fontSize: theme.fontSizes.smallerBody,
}));
