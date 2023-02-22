import { styled } from '@mui/material';

export const StyledProjectInfoWidgetContainer = styled('div')(({ theme }) => ({
    margin: '0',
    textAlign: 'center',
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadiusLarge,
    width: '100%',
    minWidth: 225,
    padding: theme.spacing(3),
    [theme.breakpoints.down('md')]: {
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        padding: theme.spacing(1.5),
    },
}));

export const StyledWidgetTitle = styled('p')(({ theme }) => ({
    marginBottom: theme.spacing(2.5),
}));

export const StyledCount = styled('span')(({ theme }) => ({
    fontSize: theme.typography.h2.fontSize,
    fontWeight: 'bold',
    color: theme.palette.text.primary,
}));
