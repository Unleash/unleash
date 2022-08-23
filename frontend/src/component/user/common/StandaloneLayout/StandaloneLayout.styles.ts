import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    container: {
        padding: '5.5rem',
        background: theme.palette.standaloneBackground,
        display: 'flex',
        [theme.breakpoints.down('md')]: {
            flexDirection: 'column',
        },
        [theme.breakpoints.down('sm')]: {
            padding: '0',
        },
        minHeight: '100vh',
    },
    leftContainer: {
        width: '40%',
        borderRadius: theme.shape.borderRadius,
        [theme.breakpoints.down('md')]: {
            borderRadius: '0',
            width: '100%',
            minHeight: 'auto',
        },
    },
    rightContainer: {
        width: '60%',
        flex: '1',
        borderTopRightRadius: '3px',
        borderBottomRightRadius: '3px',
        backgroundColor: theme.palette.background.paper,
        position: 'relative',
        [theme.breakpoints.down('md')]: {
            borderRadius: '0',
            width: '100%',
            position: 'static',
            minHeight: 'auto',
        },
    },
    title: {
        fontWeight: 'bold',
        fontSize: '1.2rem',
        marginBottom: '1rem',
    },
    innerRightContainer: {
        display: 'flex',
        justifyContent: 'center',
        height: '100%',
        padding: '6rem 3rem',
        [theme.breakpoints.down('md')]: {
            padding: '2rem 2rem',
        },
        [theme.breakpoints.down('sm')]: {
            padding: '2rem 1rem',
        },
    },
}));
