import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
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
        background: theme.palette.background.paper,
        boxShadow: '0 0 1rem rgba(0, 0, 0, 0.25)',
        borderRadius: '1rem',
        [theme.breakpoints.down('md')]: {
            padding: '2rem',
        },
    },
    close: {
        all: 'unset',
        position: 'absolute',
        top: 0,
        right: 0,
    },
    closeIcon: {
        fontSize: '1.5rem',
        color: theme.palette.inactiveIcon,
    },
}));
