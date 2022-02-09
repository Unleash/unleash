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
    inputHeader:{
        marginBottom: '0.3rem'
    },
    label: {
        minWidth: '300px',
        [theme.breakpoints.down(600)]: {
            minWidth: 'auto',
        },
    },
    tagContainer: {
        display: 'flex',
        alignItems: 'flex-start',
        marginBottom: '1rem'
    },
    tagInput: {
        width: '75%',
        marginRight: 'auto',
    },
    tagValue: {
        marginRight: '3px',
        marginBottom: '1rem'
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
    formHeader: {
        fontWeight: 'normal',
        marginTop: '0',
    },
    header: {
        fontWeight: 'normal',
    },
    permissionErrorContainer: {
        position: 'relative',
    },
    errorMessage: {
        // @ts-expect-error
        fontSize: theme.fontSizes.smallBody,
        color: theme.palette.error.main,
        position: 'absolute',
        top: '-8px',
    },
    switchContainer: {
        display: 'flex',
        alignItems: 'center',
        marginLeft: '-9px'
    },
}));
