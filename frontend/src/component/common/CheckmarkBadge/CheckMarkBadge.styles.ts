import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    badge: {
        backgroundColor: theme.palette.primary.main,
        width: '75px',
        height: '75px',
        borderRadius: '50px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    check: {
        color: '#fff',
        width: '35px',
        height: '35px',
    },
}));
