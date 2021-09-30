import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    container: {
        display: 'flex',
        width: '80%',
        margin: '0 auto',
        [theme.breakpoints.down(700)]: {
            flexDirection: 'column',
            alignItems: 'center',
        },
    },
    textContainer: {
        width: '50%',
        [theme.breakpoints.down(700)]: {
            width: '100%',
        },
    },
    iconContainer: {
        width: '50%',
        [theme.breakpoints.down(700)]: {
            width: '100%',
        },
    },
    icon: {
        width: '300px',
        height: '200px',
        [theme.breakpoints.down(700)]: {
            marginTop: '2rem',
        },
    },
}));
