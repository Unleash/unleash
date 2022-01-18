import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        border: `1px solid ${theme.palette.grey[200]}`,
        padding: '1.5rem',
        borderRadius: '5px',
        margin: '1.5rem 0',
        minWidth: '450px',
    },
    icon: {
        fill: theme.palette.grey[600],
        marginRight: '0.5rem',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '0.25rem',
    },
    infoContainer: {
        marginTop: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
    },
    infoInnerContainer: {
        textAlign: 'center',
    },
    infoTitle: { fontWeight: 'bold', marginBottom: '0.25rem' },
}));
