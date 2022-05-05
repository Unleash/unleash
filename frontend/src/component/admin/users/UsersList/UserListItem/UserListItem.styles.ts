import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    tableRow: {
        '& > td': {
            padding: '4px 16px',
            borderColor: theme.palette.grey[300],
        },
        '&:hover': {
            backgroundColor: theme.palette.grey[100],
        },
    },
    tableCellHeader: {
        '& > th': {
            backgroundColor: theme.palette.grey[200],
            fontWeight: 'normal',
            border: 0,
            '&:first-of-type': {
                borderTopLeftRadius: '8px',
                borderBottomLeftRadius: '8px',
            },
            '&:last-of-type': {
                borderTopRightRadius: '8px',
                borderBottomRightRadius: '8px',
            },
        },
    },
    errorMessage: {
        textAlign: 'center',
        marginTop: '20vh',
    },
    leftTableCell: {
        textAlign: 'left',
    },
    shrinkTableCell: {
        whiteSpace: 'nowrap',
        width: '0.1%',
    },
    avatar: {
        width: '32px',
        height: '32px',
        margin: 'auto',
    },
    firstColumnSM: {
        [theme.breakpoints.down('md')]: {
            borderTopLeftRadius: '8px',
            borderBottomLeftRadius: '8px',
        },
    },
    firstColumnXS: {
        [theme.breakpoints.down('sm')]: {
            borderTopLeftRadius: '8px',
            borderBottomLeftRadius: '8px',
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
