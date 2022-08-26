import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    menuItem: {
        minWidth: '150px',
        height: '100%',
        width: '100%',
        margin: '0',
        padding: '0',
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
        color: 'inherit',
        height: '100%',
        width: '100%',
        '&&': {
            // Override MenuItem's built-in padding.
            padding: '0.5rem 1rem',
        },
    },
}));
