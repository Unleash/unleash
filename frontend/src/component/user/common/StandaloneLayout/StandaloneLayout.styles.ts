import { makeStyles } from '@material-ui/styles';

export const useStyles = makeStyles(theme => ({
    container: {
        display: 'flex',
    },
    leftContainer: { width: '40%', minHeight: '100vh' },
    rightContainer: { width: '60%', minHeight: '100vh', position: 'relative' },
    menu: {
        position: 'absolute',
        right: '20px',
        top: '20px',
        '& a': {
            textDecoration: 'none',
            color: '#000',
        },
    },
    title: {
        fontWeight: 'bold',
        fontSize: '1.2rem',
        marginBottom: '1rem',
    },
    innerRightContainer: {
        padding: '4rem 3rem',
    },
}));
