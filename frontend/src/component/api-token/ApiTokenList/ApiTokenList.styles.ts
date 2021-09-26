import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
        [theme.breakpoints.down('xs')]: {
            justifyContent: 'center',
        },
    },
    apiError: {
        maxWidth: '400px',
        marginBottom: '1rem',
    },
    cardLink: {
        color: 'inherit',
        textDecoration: 'none',
        border: 'none',
        padding: '0',
        background: 'transparent',
        fontFamily: theme.typography.fontFamily,
        pointer: 'cursor',
    },
    center: {
        textAlign: 'center'
    }
}));
