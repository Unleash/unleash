import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    tableRow: {
        '&:hover': {
            backgroundColor: theme.palette.grey[200],
        },
    },
    leftTableCell: {
        textAlign: 'left',
        maxWidth: '300px',
    },
    description: {
        textAlign: 'left',
        maxWidth: '300px',
        [theme.breakpoints.down('md')]: {
            display: 'none',
        },
    },
    hideSM: {
        [theme.breakpoints.down('md')]: {
            display: 'none',
        },
    },
    hideXS: {
        [theme.breakpoints.down('sm')]: {
            display: 'none',
        },
    },
}));
