import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    tabNav: {
        backgroundColor: theme.palette.tabs.main,
    },
    tab: {
        [theme.breakpoints.up('lg')]: {
            minWidth: 160,
        },
    },
}));
