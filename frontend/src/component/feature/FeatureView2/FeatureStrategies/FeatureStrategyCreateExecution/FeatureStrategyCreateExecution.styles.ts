import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    container: {
        border: `1px solid ${theme.palette.grey[300]}`,
        borderRadius: '5px',
        maxWidth: '270px',
        padding: '1rem',
        marginLeft: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: theme.palette.grey[100],
    },
    header: {
        color: theme.palette.grey[600],
        textAlign: 'center',
        margin: '0.5rem 0',
        fontSize: theme.fontSizes.bodySize,
    },
}));
