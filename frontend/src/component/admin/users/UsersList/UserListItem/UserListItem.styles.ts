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
                '&, & > button': {
                    borderTopLeftRadius: theme.spacing(1),
                    borderBottomLeftRadius: theme.spacing(1),
                },
            },
            '&:last-of-type': {
                '&, & > button': {
                    borderTopRightRadius: theme.spacing(1),
                    borderBottomRightRadius: theme.spacing(1),
                },
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
