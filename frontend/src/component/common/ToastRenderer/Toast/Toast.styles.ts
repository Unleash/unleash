import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    container: {
        width: '450px',
        background: '#fff',
        boxShadow: '2px 2px 4px rgba(0,0,0,0.4)',
        zIndex: 500,
        margin: '0 auto',
        borderRadius: '12.5px',
        padding: '2rem',
    },
    innerContainer: {
        position: 'relative',
    },
    starting: {
        opacity: 0,
    },
    headerContainer: {
        display: 'flex',
        alignItems: 'center',
    },
    confettiContainer: {
        position: 'relative',
        maxWidth: '600px',
        margin: '0 auto',
        display: 'flex',
    },
    textContainer: {
        marginLeft: '1rem',
    },
    headerStyles: {
        fontWeight: 'normal',
        margin: 0,
        marginBottom: '0.5rem',
    },
    createdContainer: {
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
    },
    anim: {
        animation: `$drop 10s 3s`,
    },
    checkMark: {
        width: '65px',
        height: '65px',
    },
    buttonStyle: {
        position: 'absolute',
        top: '-33px',
        right: '-29px',
    },
    '@keyframes drop': {
        '0%': {
            opacity: '0%',
            top: '0%',
        },
        '10%': {
            opacity: '100%',
        },
        '100%': {
            top: '100%',
        },
    },
}));
