import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    title: {
        margin: 0,
        fontSize: theme.fontSizes.bodySize,
        fontWeight: theme.fontWeight.bold,
    },
}));
