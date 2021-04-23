import { makeStyles } from '@material-ui/styles';

export const useStyles = makeStyles(theme => ({
    header: {
        padding: '1rem',
        boxShadow: 'none',
        [theme.breakpoints.down('sm')]: {
            padding: '1rem 0.5rem',
        },
    },
    container: {
        display: 'flex',
        alignItems: 'center',
        [theme.breakpoints.down('sm')]: {
            padding: '0',
        },
    },
    drawerButton: {
        color: theme.palette.iconButtons.main,
    },
    headerTitle: {
        fontSize: '1.4rem',
    },
    userContainer: {
        marginLeft: 'auto',
        display: 'flex',
        alignItems: 'center',
    },
    docsLink: {
        color: '#fff',
        textDecoration: 'none',
        padding: '0.25rem 0.8rem',
        display: 'flex',
        alignItems: 'center',
    },
    docsIcon: {
        height: '25px',
        width: '25px',
    },
}));
