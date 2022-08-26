import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    mobileMarginTop: {
        [theme.breakpoints.down('md')]: {
            marginTop: theme.spacing(2),
        },
    },
}));
