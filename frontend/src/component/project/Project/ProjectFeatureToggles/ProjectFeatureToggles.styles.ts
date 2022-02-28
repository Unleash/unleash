import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    container: {
        boxShadow: 'none',
        marginLeft: '1rem',
        minHeight: '100%',
        width: 'calc(100% - 1rem)',
        position: 'relative',
        paddingBottom: '4rem',
        [theme.breakpoints.down('sm')]: {
            marginLeft: '0',
            paddingBottom: '4rem',
            width: 'inherit',
        },
    },

    bodyClass: { padding: '0.5rem 1rem' },
    header: {
        padding: '1rem',
    },
    title: {
        fontSize: '1rem',
        fontWeight: 'normal',
    },
    iconButton: {
        marginRight: '1rem',
    },
    icon: {
        color: '#000',
        height: '30px',
        width: '30px',
    },
    noTogglesFound: {
        marginBottom: '0.5rem',
    },
    link: {
        textDecoration: 'none',
    },
    actionsContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    search: {
        border: `1px solid ${theme.palette.grey[300]}`,
        height: '35px',
        marginRight: '2rem',
    },
    button: {
        whiteSpace: 'nowrap',
    },
}));
