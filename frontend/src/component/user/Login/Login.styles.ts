import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    login: {
        width: '350px',
        maxWidth: '350px',
        [theme.breakpoints.down('sm')]: {
            width: '100%',
        },
    },
    loginContainer: {
        minHeight: '100vh',
        width: '100%',
    },
    container: {
        display: 'flex',
        height: '100%',
        flexWrap: 'wrap',
    },
    contentContainer: {
        width: '50%',
        padding: '4rem 3rem',
        minHeight: '100vh',
        [theme.breakpoints.down('md')]: {
            width: '100%',
            minHeight: 'auto',
        },
    },
    title: {
        fontSize: theme.fontSizes.mainHeader,
        marginBottom: '1rem',
        textAlign: 'center',
    },
    logo: {
        marginRight: '10px',
        width: '40px',
        height: '30px',
    },
    subTitle: {
        fontSize: '1.25rem',
    },
    loginFormContainer: {
        display: 'flex',
        flexDirection: 'column',
    },
    imageContainer: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: '8rem',
    },
}));
