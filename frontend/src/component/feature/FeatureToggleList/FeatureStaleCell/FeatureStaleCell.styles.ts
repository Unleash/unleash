import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    status: {
        color: theme.palette.success.dark,
        fontSize: 'inherit',
    },
    stale: {
        color: theme.palette.error.dark,
    },
}));
