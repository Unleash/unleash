import { makeStyles } from '@material-ui/styles';

export const useStyles = makeStyles(theme => ({
    loginContainer: {
        minWidth: '350px',
        [theme.breakpoints.down('xs')]: {
            width: '100%',
            minWidth: 'auto',
        },
    },
    contentContainer: {
        display: 'flex',
        flexDirection: 'column',
    },
    apiError: {
        color: theme.palette.error.main,
        marginBottom: '0.5rem',
    },
}));
