import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    header: {
        backgroundColor: theme.palette.headerBackground,
        padding: '0.5rem',
        boxShadow: 'none',
        position: 'relative',
        zIndex: 300,
    },
    links: {
        display: 'flex',
        justifyContent: 'center',
        marginLeft: '1.5rem',
        '& a': {
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
        maxWidth: 1280,
        [theme.breakpoints.down('md')]: {
            padding: '0',
        },
    },
    nav: {
        display: 'flex',
        alignItems: 'center',
        flexGrow: 1,
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
    },
    icon: {
        color: theme.palette.grey[700],
    },
    wideButton: {
        borderRadius: 100,
    },
}));
