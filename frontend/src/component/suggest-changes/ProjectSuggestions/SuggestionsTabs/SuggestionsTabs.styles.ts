import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    tabContainer: {
        paddingLeft: 0,
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
