import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    matcherContainer: {
        position: 'relative',
    },
    matcherIcon: {
        marginRight: '5px',
    },
    matcher: {
        position: 'absolute',
        bottom: '-8px',
        display: 'flex',
        alignItems: 'center',
    },
    matcherError: {
        color: theme.palette.error.main,
    },
    matcherSuccess: {
        color: theme.palette.primary.main,
    },
}));
