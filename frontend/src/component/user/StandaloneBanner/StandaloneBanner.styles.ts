import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    gradient: {
        display: 'flex',
        justifyContent: 'center',
        [theme.breakpoints.up('sm')]: {
            borderBottomLeftRadius: '3px',
            borderTopLeftRadius: '3px',
        },
    },
    title: {
        color: '#fff',
        marginBottom: '1rem',
        fontSize: '2rem',
        marginTop: '5rem',
        [theme.breakpoints.down('sm')]: {
            display: 'none',
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
            display: 'none',
        },
        [theme.breakpoints.down('xs')]: {
            display: 'none',
        },
        fontSize: '2rem',
        fontWeight: 'normal',
    },
    logoContainer: {
        position: 'absolute',
        [theme.breakpoints.up('md')]: {
            bottom: '-50px',
            left: '-50px',
            display: 'flex',
            flexDirection: 'column',
        },
    },
    logo: {
        width: '200px',
        [theme.breakpoints.up('md')]: {
            width: '240px',
            height: '200px',
        },
    },
}));
