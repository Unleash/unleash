import { makeStyles } from 'tss-react/mui';
import { unleashGrey } from 'themes/themeColors';

export const useStyles = makeStyles()(theme => ({
    tableRow: {
        '& > td': {
            padding: '4px 16px',
            borderColor: unleashGrey[300],
        },
        '&:hover': {
            backgroundColor: unleashGrey[100],
        },
    },
    tableCellHeader: {
        '& > th': {
            backgroundColor: unleashGrey[200],
            fontWeight: 'normal',
            border: 0,
            '&:first-child': {
                borderTopLeftRadius: '8px',
                borderBottomLeftRadius: '8px',
            },
            '&:last-child': {
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
