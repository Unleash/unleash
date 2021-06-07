import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    feedback: {
        borderRadius: '3px',
        backgroundColor: '#fff',
        zIndex: '9999',
        boxShadow: '2px 2px 4px 4px rgba(143,143,143, 0.25)',
        padding: '1.5rem',
        maxWidth: '400px',
        width: '400px',
        height: '200px',
    },
    animateContainer: {
        zIndex: '9999',
    },
    feedbackStart: {
        opacity: '0',
        position: 'fixed',
        right: '40px',
        bottom: '40px',
        transform: 'translateY(400px)',
    },
    feedbackEnter: {
        transform: 'translateY(0)',
        opacity: '1',
        transition: 'transform 0.6s ease, opacity 1s ease',
    },
    feedbackLeave: {
        transform: 'translateY(400px)',
        opacity: '0',
        transition: 'transform 1.25s ease, opacity 1s ease',
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
        backgroundColor: '#fff',
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
