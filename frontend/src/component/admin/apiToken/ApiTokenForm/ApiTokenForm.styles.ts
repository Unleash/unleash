import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
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
    radioGroup: {
        marginBottom: theme.spacing(2),
    },
    radioItem: {
        marginBottom: theme.spacing(1),
    },
    radio: {
        marginLeft: theme.spacing(1.5),
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
    permissionErrorContainer: {
        position: 'relative',
    },
    errorMessage: {
        fontSize: theme.fontSizes.smallBody,
        color: theme.palette.error.main,
        position: 'absolute',
        top: '-8px',
    },
    selectOptionsLink: {
        cursor: 'pointer',
    },
    selectOptionCheckbox: {
        marginRight: '0.2rem',
    },
}));
