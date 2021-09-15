import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    header: {
        backgroundColor: '#fff',
        color: '#000',
        padding: '0.5rem',
        boxShadow: 'none',
        position: 'relative',
        zIndex: '300',
    },
    links: {
        display: 'flex',
        justifyContent: 'center',
        marginLeft: '1.5rem',
        ['& a']: {
            textDecoration: 'none',
            color: 'inherit',
            marginRight: '1.5rem',
            display: 'flex',
            alignItems: 'center',
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
        color: '#000',
    },
    advancedNavButton: {
        border: 'none',
        background: 'transparent',
        height: '100%',
        display: 'flex',
        fontSize: '1rem',
        fontFamily: theme.typography.fontFamily,
        alignItems: 'center',
        color: 'inherit',
        cursor: 'pointer',
    },
    headerTitle: {
        fontSize: '1.4rem',
    },
    userContainer: {
        marginLeft: 'auto',
        display: 'flex',
        alignItems: 'center',
    },
    logoOnly: {
        width: '60px',
    },
    logo: {
        width: '150px',
    },
    popover: {
        top: '25px',
    },
    menuItem: {
        minWidth: '150px',
    },
    menuItemBox: {
        width: '12.5px',
        height: '12.5px',
        display: 'block',
        backgroundColor: theme.palette.primary.main,
        marginRight: '1rem',
        borderRadius: '2px',
    },
    navMenuLink: {
        textDecoration: 'none',
        alignItems: 'center',
        display: 'flex',
        color: '#000',
    },
    docsLink: {
        color: '#000',
        textDecoration: 'none',
        padding: '0.25rem 0.8rem',
        display: 'flex',
        alignItems: 'center',
    },
    docsIcon: {
        color: '#6C6C6C',
        height: '25px',
        width: '25px',
    },
}));
