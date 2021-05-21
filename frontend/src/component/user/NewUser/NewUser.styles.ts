import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    newUser: {
        width: '350px',
        [theme.breakpoints.down('xs')]: {
            width: '100%',
        },
    },
    title: {
        fontSize: theme.fontSizes.mainHeader,
        marginBottom: '1.25rem',
        display: 'flex',
        alignItems: 'center',
    },
    inviteText: {
        marginBottom: '1rem',
        textAlign: 'center',
    },
    container: {
        display: 'flex',
    },
    roleContainer: {
        marginTop: '2rem',
    },
    innerContainer: {
        width: '60%',
        padding: '4rem 3rem',
    },
    buttonContainer: {
        display: 'flex',
        marginTop: '1rem',
    },
    primaryBtn: {
        marginRight: '8px',
    },
    subtitle: {
        margin: '0.5rem 0',
    },
    passwordHeader: {
        marginTop: '2rem',
    },
    emailField: {
        minWidth: '300px',
        width: '100%',
        [theme.breakpoints.down('xs')]: {
            minWidth: '100%',
        },
    },
}));
