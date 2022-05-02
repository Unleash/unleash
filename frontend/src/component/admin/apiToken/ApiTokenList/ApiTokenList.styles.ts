import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    tableRow: {
        '&:hover': {
            backgroundColor: theme.palette.grey[200],
        },
    },
    container: {
        display: 'flex',
        flexWrap: 'wrap',
        [theme.breakpoints.down('sm')]: {
            justifyContent: 'center',
        },
    },
    center: {
        textAlign: 'center',
    },
    actionsContainer: {
        textAlign: 'center',
        display: 'flex-inline',
        flexWrap: 'nowrap',
    },
    hideSM: {
        [theme.breakpoints.down('md')]: {
            display: 'none',
        },
    },
    hideMD: {
        [theme.breakpoints.down('lg')]: {
            display: 'none',
        },
    },
    hideXS: {
        [theme.breakpoints.down('sm')]: {
            display: 'none',
        },
    },
    token: {
        textAlign: 'left',
        [theme.breakpoints.up('sm')]: {
            display: 'none',
        },
    },
}));
