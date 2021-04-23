import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    container: {
        display: 'flex',
    },
    roleContainer: {
        marginTop: '2rem',
    },
    innerContainer: {
        width: '60%',
        minHeight: '100vh',
        padding: '4rem 3rem',
    },
    buttonContainer: {
        display: 'flex',
        marginTop: '1rem',
    },
    primaryBtn: {
        marginRight: '8px',
    },
    subtitle: {
        marginBottom: '0.5rem',
        fontSize: '1.1rem',
    },
    emailField: {
        minWidth: '300px',
        [theme.breakpoints.down('xs')]: {
            minWidth: '100%',
        },
    },
}));
