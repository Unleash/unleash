import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    tabContainer: {
        padding: '0 2rem',
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
