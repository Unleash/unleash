import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    splashMainContainer: {
        backgroundColor: theme.palette.primary.light,
        height: '100%',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '3rem 0',
        [theme.breakpoints.down('xs')]: {
            padding: '0',
        },
    },
    splashContainer: {
        backgroundColor: theme.palette.primary.main,
        position: 'relative',
        minHeight: '650px',
        width: '600px',
        padding: '2rem 1.5rem',
        borderRadius: '5px',
        color: '#fff',
        display: 'flex',
        overflowX: 'hidden',
        flexDirection: 'column',
        [theme.breakpoints.down('xs')]: {
            top: '0px',
            left: '0px',
            right: '0px',
            bottom: '0px',
            padding: '2rem 0',
            zIndex: '500',
            position: 'fixed',
            width: '100%',
            height: '100%',
            borderRadius: 0,
        },
    },
    closeButtonContainer: {
        display: 'inline-flex',
        justifyContent: 'flex-end',
        color: '#fff',
        position: 'absolute',
        right: '-10px',
        top: '5px',
    },
    closeButton: {
        textDecoration: 'none',
        right: '10px',
        color: '#fff',
        '&:hover': {
            backgroundColor: 'inherit',
        },
    },
    controllers: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        height: 'inherit',
        marginBottom: 5,
        marginTop: 'auto',
    },
    circlesContainer: {
        display: 'flex',
        justifyContent: 'center',
    },
    circles: {
        display: 'inline-flex',
        justifyContent: 'center',
        marginTop: 20,
        marginBottom: 15,
        position: 'relative',
    },
    buttonsContainer: {
        display: 'flex',
        justifyContent: 'center',
    },
    button: {
        textDecoration: 'none',
        width: '100px',
        color: '#fff',
        '&:hover': {
            backgroundColor: 'inherit',
        },
    },
    nextButton: {
        textDecoration: 'none',
        width: '100px',
        color: theme.palette.primary.light,
        backgroundColor: '#fff',
        '&:hover': {
            backgroundColor: '#fff',
        },
    },
}));
