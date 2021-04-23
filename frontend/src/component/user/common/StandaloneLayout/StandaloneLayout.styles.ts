import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    container: {
        display: 'flex',
        [theme.breakpoints.down('sm')]: {
            flexDirection: 'column',
        },
        overflow: 'hidden',
    },
    leftContainer: {
        width: '40%',
        minHeight: '100vh',
        [theme.breakpoints.down('sm')]: {
            width: '100%',
            minHeight: 'auto',
        },
    },
    bannerSubtitle: {
        [theme.breakpoints.down('sm')]: {
            maxWidth: '300px',
        },
    },
    rightContainer: {
        width: '60%',
        minHeight: '100vh',
        position: 'relative',
        [theme.breakpoints.down('sm')]: {
            width: '100%',
            position: 'static',
            minHeight: 'auto',
        },
    },
    menu: {
        position: 'absolute',
        right: '20px',
        top: '20px',
        '& a': {
            textDecoration: 'none',
            color: '#000',
        },
        [theme.breakpoints.down('sm')]: {
            '& a': {
                color: '#fff',
            },
        },
    },
    title: {
        fontWeight: 'bold',
        fontSize: '1.2rem',
        marginBottom: '1rem',
    },
    innerRightContainer: {
        padding: '4rem 3rem',
        [theme.breakpoints.down('sm')]: {
            padding: '2rem 2rem',
        },
        [theme.breakpoints.down('xs')]: {
            padding: '2rem 1rem',
        },
    },
}));
