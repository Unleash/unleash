import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    container: {
        maxWidth: '400px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
    },
    input: { width: '100%', marginBottom: '1rem' },
    label: {
        minWidth: '300px',
        [theme.breakpoints.down(600)]: {
            minWidth: 'auto',
        },
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
    roleBox: {
        margin: '3px 0',
        border: '1px solid #EFEFEF',
        padding: '1rem',
    },
    userInfoContainer: {
        margin: '-20px 0',
    },
    roleRadio: {
        marginRight: '15px',
    },
    roleSubtitle: {
        margin: '0.5rem 0',
    },
    errorAlert: {
        marginBottom: '1rem',
    },
    flexRow: {
        display: 'flex',
        alignItems: 'center',
    },
}));
