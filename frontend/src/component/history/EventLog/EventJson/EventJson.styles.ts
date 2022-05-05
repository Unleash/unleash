import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    historyItem: {
        padding: '5px',
        '&:nth-of-type(odd)': {
            backgroundColor: theme.code.background,
        },
    },
}));
