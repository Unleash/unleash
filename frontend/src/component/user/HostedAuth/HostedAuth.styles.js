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
    },

    fancyLine: {
        display: 'flex',
        width: '100%',
        margin: '10px 0',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        color: 'gray',
        '&::before': {
            content: '""',
            borderTop: '1px solid silver',
            margin: '0 20px 0 0',
            flex: '1 0 20px',
        },
        '&::after': {
            content: '""',
            borderTop: '1px solid silver',
            margin: '0 20px 0 0',
            flex: '1 0 20px',
        }
    }
}));
