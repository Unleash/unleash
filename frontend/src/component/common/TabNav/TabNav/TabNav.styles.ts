import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    tabNav: {
        // @ts-expect-error
        backgroundColor: theme.palette.tabs.main,
    },
}));
