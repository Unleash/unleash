import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    blue: {
        color: theme.code.edited,
    },
    negative: {
        color: theme.code.diffSub,
    },
    positive: {
        color: theme.code.diffAdd,
    },
}));
