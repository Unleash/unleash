import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    container: {
        borderRadius: '12.5px',
        padding: '2rem',
        backgroundColor: '#fff',
        maxWidth: '450px',
        boxShadow: `2px 2px 4px rgba(0,0,0,.4)`,
    },
    refreshHeader: {
        fontSize: theme.fontSizes.mainHeader,
        marginBottom: '0.5rem',
    },
    paragraph: { marginBottom: '0.5rem' },
    buttonContainer: {
        display: 'flex',
        marginTop: '1rem',
    },
    mainBtn: {
        marginRight: '1rem',
    },
    fadeInStart: {
        opacity: '0',
        position: 'fixed',
        right: '40px',
        top: '100px',
        transform: 'translateX(-400px)',
        zIndex: 400,
    },
    fadeInEnter: {
        transform: 'translateX(0)',
        opacity: '1',
        transition: 'transform 0.6s ease, opacity 1s ease',
    },
    fadeInLeave: {
        transform: 'translateX(400px)',
        opacity: '0',
        transition: 'transform 1.25s ease, opacity 1s ease',
    },
}));
