import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    main: {
        paddingBottom: '2rem',
    },
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: '5rem',
    },
    title: {
        fontSize: theme.fontSizes.mainHeader,
        marginBottom: 12,
    },
    subtitle: {
        fontSize: theme.fontSizes.smallBody,
        color: theme.palette.grey[600],
        maxWidth: 515,
        marginBottom: 20,
        wordBreak: 'break-all',
        whiteSpace: 'normal',
    },
    tableRow: {
        background: '#F6F6FA',
        borderRadius: '8px',
    },
    paramButton: {
        color: theme.palette.primary.dark,
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
