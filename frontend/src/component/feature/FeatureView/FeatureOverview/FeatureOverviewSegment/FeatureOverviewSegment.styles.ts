import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    container: {
        width: '100%',
        padding: '1rem',
        fontSize: theme.fontSizes.smallBody,
        backgroundColor: theme.palette.grey[200],
        margin: '0.5rem 0',
        position: 'relative',
        borderRadius: '5px',
        textAlign: 'center',
    },
    link: {
        textDecoration: 'none',
        fontWeight: theme.fontWeight.bold,
        color: theme.palette.primary.main,
    },
}));
