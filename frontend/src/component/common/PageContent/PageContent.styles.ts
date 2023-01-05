import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    headerPadding: {
        padding: theme.spacing(2, 4),
    },
    bodyContainer: {
        padding: theme.spacing(4),
        [theme.breakpoints.down('md')]: {
            padding: theme.spacing(2),
        },
        [theme.breakpoints.down('sm')]: {
            overflowX: 'auto',
        },
    },
    paddingDisabled: {
        padding: '0',
    },
    borderDisabled: {
        border: 'none',
    },
}));
