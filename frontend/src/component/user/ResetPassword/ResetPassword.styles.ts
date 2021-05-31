import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    resetPassword: {
        width: '350px',
        maxWidth: '350px',
        [theme.breakpoints.down('xs')]: {
            width: '100%',
        },
    },
    container: {
        display: 'flex',
    },
    innerContainer: { width: '40%', minHeight: '100vh' },
    title: {
        fontWeight: 'bold',
        fontSize: '1.2rem',
        marginBottom: '1rem',
    },
}));
