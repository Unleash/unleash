import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    mobileMarginTop: {
        [theme.breakpoints.down('sm')]: {
            marginTop: theme.spacing(2),
        },
    },
}));
