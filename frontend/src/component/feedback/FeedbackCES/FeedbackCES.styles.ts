import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    overlay: {
        pointerEvents: 'none',
        display: 'grid',
        padding: '1rem',
        overflowY: 'auto',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
    },
    modal: {
        pointerEvents: 'auto',
        position: 'relative',
        padding: '4rem',
        background: 'white',
        boxShadow: '0 0 1rem rgba(0, 0, 0, 0.25)',
        borderRadius: '1rem',
        [theme.breakpoints.down('sm')]: {
            padding: '2rem',
        },
    },
    close: {
        all: 'unset',
        position: 'absolute',
        top: 0,
        right: 0,
        padding: '1rem',
        cursor: 'pointer',
    },
    closeIcon: {
        fontSize: '1.5rem',
        color: theme.palette.grey[600],
    },
}));
