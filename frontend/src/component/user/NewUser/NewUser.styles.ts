import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    newUser: {
        width: '350px',
        [theme.breakpoints.down('sm')]: {
            width: '100%',
        },
    },
    title: {
        fontSize: theme.fontSizes.mainHeader,
        marginBottom: '1.25rem',
        textAlign: 'center',
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
        [theme.breakpoints.down('sm')]: {
            minWidth: '100%',
        },
    },
}));
