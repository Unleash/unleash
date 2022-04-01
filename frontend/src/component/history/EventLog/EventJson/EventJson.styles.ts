import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    historyItem: {
        padding: '5px',
        '&:nth-child(odd)': {
            // @ts-expect-error
            backgroundColor: theme.palette.code.background,
        },
    },
}));
