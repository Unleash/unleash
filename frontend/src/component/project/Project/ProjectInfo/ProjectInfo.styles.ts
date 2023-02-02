import { Link } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { flexRow } from 'themes/themeStyles';
import { styled } from '@mui/material';

export const StyledProjectInfoSidebarContainer = styled('div')(({ theme }) => ({
    ...flexRow,
    width: '225px',
    flexDirection: 'column',
    gap: theme.spacing(2),
    boxShadow: 'none',
    [theme.breakpoints.down('md')]: {
        flexDirection: 'row',
        alignItems: 'stretch',
        width: '100%',
        marginBottom: theme.spacing(2),
    },
}));

export const StyledProjectInfoWidgetContainer = styled('div')(({ theme }) => ({
    margin: '0',
    textAlign: 'center',
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadiusLarge,
    width: '100%',
    padding: theme.spacing(3),
    [theme.breakpoints.down('md')]: {
        ...flexRow,
        flexDirection: 'column',
        justifyContent: 'center',
        fontSize: theme.fontSizes.smallBody,
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

export const StyledSpanLinkText = styled('p')(({ theme }) => ({
    [theme.breakpoints.down('md')]: {
        display: 'none',
    },
}));

export const StyledLink = styled(Link)(({ theme }) => ({
    textDecoration: 'none',
    ...flexRow,
    justifyContent: 'center',
    color: theme.palette.primary.main,
    [theme.breakpoints.down('md')]: {
        position: 'absolute',
        bottom: theme.spacing(1.5),
    },
}));

export const StyledArrowIcon = styled(ArrowForwardIcon)(({ theme }) => ({
    color: theme.palette.primary.main,
    marginLeft: theme.spacing(1),
}));
