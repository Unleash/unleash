import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    title: {
        color: '#fff',
        marginBottom: '1rem',
        fontSize: '2rem',
        marginTop: '5rem',
        [theme.breakpoints.down('sm')]: {
            textAlign: 'left',
            fontSize: '1.75rem',
            marginTop: 0,
        },
    },
    container: {
        padding: '6rem 4rem',
        color: '#fff',
        position: 'relative',
        borderTopLeftRadius: '3px',
        borderBottomLeftRadius: '3px',
        textAlign: 'right',
        [theme.breakpoints.down('sm')]: {
            padding: '3rem 2rem',
        },
        [theme.breakpoints.down('xs')]: {
            padding: '3rem 1rem',
        },
    },
    bannerSubtitle: {
        [theme.breakpoints.down('sm')]: {
            maxWidth: '300px',
            fontSize: '1.75rem',
            textAlign: 'left',
        },
        [theme.breakpoints.down('xs')]: {
            display: 'none',
        },
        fontSize: '2rem',
        fontWeight: '300',
    },
    logoContainer: {
        position: 'absolute',
        bottom: '-50px',
        left: '-50px',
        display: 'flex',
        flexDirection: 'column',
        [theme.breakpoints.down('sm')]: {
            display: 'none',
        },
    },
    logo: {
        width: '240px',
        height: '240px',
    },
}));
