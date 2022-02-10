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
    selectInput: {
        marginBottom: '1rem',
        minWidth: '400px',
        [theme.breakpoints.down(600)]: {
            minWidth: '379px',
        },
    },
    link: {
        color: theme.palette.primary.light,
    },
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
    typeDescription: {
        fontSize: theme.fontSizes.smallBody,
        color: theme.palette.grey[600],
        top: '-13px',
        position: 'relative',
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
        fontSize: theme.fontSizes.smallBody,
        color: theme.palette.error.main,
        position: 'absolute',
        top: '-8px',
    },
    roleSubtitle: {
        margin: '0.5rem 0',
    },
    flexRow: {
        display: 'flex',
        alignItems: 'center',
        marginTop: '0.5rem',
    },
}));
