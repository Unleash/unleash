import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    tableRow: {
        '&:hover': {
            backgroundColor: theme.palette.grey[200],
        },
    },
    leftTableCell: {
        textAlign: 'left',
        maxWidth: '300px',
    },
    icon: {
        color: theme.palette.grey[600],
    },
    description: {
        textAlign: 'left',
        maxWidth: '300px',
        [theme.breakpoints.down('sm')]: {
            display: 'none',
        },
    },
    hideSM: {
        [theme.breakpoints.down('sm')]: {
            display: 'none',
        },
    },
    hideXS: {
        [theme.breakpoints.down('xs')]: {
            display: 'none',
        },
    },
}));
