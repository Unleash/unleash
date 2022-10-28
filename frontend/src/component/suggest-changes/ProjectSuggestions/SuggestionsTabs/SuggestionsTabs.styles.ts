import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    header: {
        padding: theme.spacing(0, 4),
    },
    tabContainer: {
        paddingLeft: 0,
        paddingBottom: 0,
    },
    tabButton: {
        textTransform: 'none',
        width: 'auto',
        fontSize: '1rem',
        [theme.breakpoints.up('md')]: {
            minWidth: 160,
        },
    },
}));
