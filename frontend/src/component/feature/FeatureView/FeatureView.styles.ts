import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    container: { borderRadius: '10px', boxShadow: 'none', display: 'flex' },
    header: {
        backgroundColor: '#fff',
        borderRadius: '10px',
        marginBottom: '1rem',
    },
    toggleInfoContainer: {
        display: 'flex',
        alignItems: 'center',
    },
    innerContainer: {
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    separator: {
        width: '100%',
        backgroundColor: theme.palette.grey[200],
        height: '1px',
    },
    tabContainer: {
        padding: '1rem 2rem',
    },
    tabButton: {
        textTransform: 'none',
        width: 'auto',
        fontSize: '1rem',
    },
    featureViewHeader: {
        fontSize: theme.fontSizes.mainHeader,
        fontWeight: 'normal',
        display: 'flex',
        alignItems: 'center',
    },
    statusContainer: {
        marginLeft: '0.5rem',
    },
    [theme.breakpoints.down(500)]: {
        innerContainer: {
            flexDirection: 'column',
        },
    },
    featureId: {
        wordBreak: 'break-all',
    },
}));
