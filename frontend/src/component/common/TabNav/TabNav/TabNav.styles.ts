import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    tabNav: {
        backgroundColor: theme.palette.background.paper,
        borderBottom: '1px solid',
        borderBottomColor: theme.palette.grey[300],
        borderRadius: 0,
    },
    tab: {
        [theme.breakpoints.up('lg')]: {
            minWidth: 160,
        },
    },
}));
