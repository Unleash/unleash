import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    helperText: { marginBottom: '1rem' },
    formHeader: {
        fontWeight: 'bold',
        fontSize: '1rem',
        marginTop: '2rem',
    },
    radioGroup: {
        flexDirection: 'row',
    },
    environmentDetailsContainer: {
        display: 'flex',
        flexDirection: 'column',
        margin: '1rem 0',
    },
    submitButton: {
        marginTop: '1rem',
        width: '150px',
        marginRight: '1rem',
    },
    btnContainer: {
        display: 'flex',
        justifyContent: 'center',
    },
    inputField: {
        width: '100%',
        marginTop: '1rem',
    },
}));
