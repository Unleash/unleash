import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    container: {
        maxWidth: '470px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
    },
    input: { width: '100%', marginBottom: '1rem' },
    inputHeader: {
        marginBottom: '0.3rem',
    },
    label: {
        minWidth: '300px',
        [theme.breakpoints.down(600)]: {
            minWidth: 'auto',
        },
    },
    tagContainer: {
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: '0.5rem',
        marginBottom: '1rem',
    },
    tagInput: {
        gridColumn: 1,
    },
    tagButton: {
        gridColumn: 2,
    },
    buttonContainer: {
        marginTop: 'auto',
        display: 'flex',
        justifyContent: 'flex-end',
    },
    cancelButton: {
        marginLeft: '1.5rem',
    },
    inputDescription: {
        marginBottom: '0.5rem',
    },
    permissionErrorContainer: {
        position: 'relative',
    },
    errorMessage: {
        fontSize: theme.fontSizes.smallBody,
        color: theme.palette.error.main,
        position: 'absolute',
        top: '-8px',
    },
    switchContainer: {
        display: 'flex',
        alignItems: 'center',
        marginLeft: '-9px',
    },
}));
