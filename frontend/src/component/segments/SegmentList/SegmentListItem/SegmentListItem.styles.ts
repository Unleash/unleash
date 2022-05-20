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
    icon: {
        color: theme.palette.inactiveIcon,
    },
    descriptionCell: {
        textAlign: 'left',
        maxWidth: '300px',
        [theme.breakpoints.down('md')]: {
            display: 'none',
        },
    },
    createdAtCell: {
        [theme.breakpoints.down('sm')]: {
            display: 'none',
        },
        textAlign: 'left',
        maxWidth: '300px',
    },
}));
