import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()({
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '2rem',
        position: 'fixed',
        inset: 0,
        backgroundColor: '#fff',
        width: '100%',
    },
    logo: {
        height: '80px',
    },
    content: {
        display: 'flex',
        position: 'relative',
    },
    buttonContainer: {
        marginTop: '2rem',
    },
    homeButton: {
        marginLeft: '1rem',
    },
    icon: {
        height: '150px',
        width: '150px',
        position: 'absolute',
        right: 100,
        top: 45,
    },
});
