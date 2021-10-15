import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    bodyContainer: {
        borderRadius: '12.5px',
        backgroundColor: '#fff',
        padding: '2rem',
    },
    formContainer: {
        marginBottom: '1.5rem',
        maxWidth: '350px',
    },
    nameInput: {
        marginRight: `1.5rem`,
        minWidth: `250px`
    }
}));
