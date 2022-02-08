import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    container: {
        borderRadius: '10px',
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem',
        maxWidth: '350px',
        minWidth: '350px',
        marginRight: '1rem',
        marginTop: '1rem',
    },

    header: {
        fontSize: theme.fontSizes.subHeader,
        fontWeight: 'normal',
        margin: 0,
        marginBottom: '0.5rem',
    },
    [theme.breakpoints.down(1000)]: {
        container: {
            marginBottom: '1rem',
            width: '100%',
            maxWidth: 'none',
            minWidth: 'auto',
        },
    },
}));
