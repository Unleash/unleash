import { makeStyles } from '@material-ui/styles';

export const useStyles = makeStyles(theme => ({
    historyItem: {
        padding: '5px',
        '&:nth-child(odd)': {
            backgroundColor: theme.palette.code.background,
        },
    },
}));
