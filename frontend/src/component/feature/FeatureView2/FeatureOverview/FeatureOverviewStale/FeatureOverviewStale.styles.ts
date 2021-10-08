import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    container: {
        borderRadius: '10px',
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '350px',
        minWidth: '350px',
        marginRight: '1rem',
        marginTop: '1rem',
    },
    [theme.breakpoints.down(800)]: {
        container: {
            width: '100%',
            maxWidth: 'none',
        },
    },
    status: {
        height: '12.5px',
        width: '12.5px',
        backgroundColor: theme.palette.success.main,
        borderRadius: '50%',
        marginLeft: '0.5rem',
    },
    statusStale: {
        backgroundColor: theme.palette.error.main,
    },
    staleHeaderContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem',
        borderBottom: `1px solid ${theme.palette.grey[300]}`,
    },
    staleHeader: {
        display: 'flex',
        alignItems: 'center',
    },
    header: {
        fontSize: theme.fontSizes.subHeader,
        fontWeight: 'normal',
        margin: 0,
    },
    body: {
        display: 'flex',
        flexDirection: 'column',
        padding: '1rem',
    },
    bodyItem: {
        margin: '0.5rem 0',
        fontSize: theme.fontSizes.bodySize,
        display: 'flex',
        alignItems: 'center',
    },
    headerIcon: {
        marginRight: '1rem',
        height: '40px',
        width: '40px',
        fill: theme.palette.primary.main,
    },
    descriptionContainer: {
        display: 'flex',
        alignItems: 'center',
        color: theme.palette.grey[600],
    },
    staleButton: {
        display: 'flex',
    },
}));
