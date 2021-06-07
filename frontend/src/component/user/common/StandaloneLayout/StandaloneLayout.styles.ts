import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    container: {
        padding: '5.5rem',
        background: '#EFF2F2',
        display: 'flex',
        [theme.breakpoints.down('sm')]: {
            flexDirection: 'column',
        },
        [theme.breakpoints.down('xs')]: {
            padding: '0',
        },
        minHeight: '100vh',
    },
    leftContainer: {
        width: '40%',
        borderRadius: '3px',
        [theme.breakpoints.down('sm')]: {
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
        backgroundColor: '#fff',
        position: 'relative',
        [theme.breakpoints.down('sm')]: {
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
        [theme.breakpoints.down('sm')]: {
            padding: '2rem 2rem',
        },
        [theme.breakpoints.down('xs')]: {
            padding: '2rem 1rem',
        },
    },
}));
