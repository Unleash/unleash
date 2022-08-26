import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    feedback: {
        borderRadius: '12.5px',
        backgroundColor: theme.palette.background.paper,
        zIndex: 9999,
        boxShadow: '2px 2px 4px 4px rgba(143,143,143, 0.25)',
        padding: '1.5rem',
        maxWidth: '400px',
    },
    animateContainer: {
        zIndex: 9999,
    },
    container: {
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
    },
    close: {
        position: 'absolute',
        right: '-38px',
        top: '-47px',
        backgroundColor: theme.palette.background.paper,
        boxShadow: '2px 2px 4px 4px rgba(143,143,143, 0.25)',
        ['&:hover']: {
            backgroundColor: '#fff',
        },
    },
    logo: {
        width: '25px',
        height: '25px',
    },
    cancel: {
        marginLeft: '1rem',
    },
}));
