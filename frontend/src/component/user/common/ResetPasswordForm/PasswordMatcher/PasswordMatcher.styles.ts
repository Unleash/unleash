import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    matcherContainer: {
        position: 'relative',
        paddingTop: theme.spacing(0.5),
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
