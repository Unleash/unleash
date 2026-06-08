import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()((theme) => ({
    // Reduce the top gap below the page header to match the flags overview /
    // change requests pages (~12px), keeping the default side/bottom padding.
    bodyClass: {
        padding: theme.spacing(1.5, 4, 4, 4),
        [theme.breakpoints.down('md')]: {
            padding: theme.spacing(1.5, 2, 2, 2),
        },
        overflowX: 'auto',
    },
}));
