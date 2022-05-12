import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    highlighter: {
        '&>mark': {
            backgroundColor: theme.palette.highlight,
        },
    },
}));
