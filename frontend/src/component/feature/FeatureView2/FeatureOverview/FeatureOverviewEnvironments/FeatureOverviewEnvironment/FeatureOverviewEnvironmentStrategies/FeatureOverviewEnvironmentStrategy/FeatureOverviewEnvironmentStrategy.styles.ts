import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    container: {
        borderRadius: '12.5px',
        border: `1px solid ${theme.palette.grey[300]}`,
        width: '250px',
        margin: '0.3rem',
    },
    header: {
        padding: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        borderBottom: `1px solid ${theme.palette.grey[300]}`,
    },
    icon: {
        fill: theme.palette.grey[600],
        marginRight: '0.5rem',
    },
    editStrategy: {
        marginLeft: 'auto',
    },
    body: {
        padding: '1rem',
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        alignItems: 'center',
    },
}));
