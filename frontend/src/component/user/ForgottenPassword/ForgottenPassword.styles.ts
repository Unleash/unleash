import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    forgottenPassword: {
        width: '350px',
        [theme.breakpoints.down('xs')]: {
            width: '100%',
        },
    },
    button: {
        width: '150px',
        margin: '1rem auto',
    },
    email: {
        display: 'block',
        margin: '0.5rem 0',
    },
    loginText: {
        textAlign: 'center',
    },
}));
