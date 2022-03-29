import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    empty: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBlock: '5rem',
    },
    title: {
        fontSize: theme.fontSizes.mainHeader,
        marginBottom: '1.25rem',
    },
    subtitle: {
        fontSize: theme.fontSizes.smallBody,
        color: theme.palette.grey[600],
        maxWidth: 515,
        marginBottom: 20,
        textAlign: 'center',
    },
    tableRow: {
        background: '#F6F6FA',
        borderRadius: '8px',
    },
    paramButton: {
        textDecoration: 'none',
        color: theme.palette.primary.main,
        fontWeight: theme.fontWeight.bold,
    },
    cell: {
        borderBottom: 'none',
        display: 'table-cell',
    },
    firstHeader: {
        borderTopLeftRadius: '5px',
        borderBottomLeftRadius: '5px',
    },
    lastHeader: {
        borderTopRightRadius: '5px',
        borderBottomRightRadius: '5px',
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
