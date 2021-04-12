import { makeStyles } from '@material-ui/styles';

export const useStyles = makeStyles(theme => ({
    blue: {
        color: theme.palette.code.edited,
    },
    negative: {
        color: theme.palette.code.diffSub,
    },
    positive: {
        color: theme.palette.code.diffAdd,
    },
}));
