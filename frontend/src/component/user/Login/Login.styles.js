import { makeStyles } from '@material-ui/styles';

export const useStyles = makeStyles(theme => ({
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
        [theme.breakpoints.down('sm')]: {
            width: '100%',
            minHeight: 'auto',
        },
    },
    gradient: {
        background: `linear-gradient(${theme.palette.login.gradient.top}, ${theme.palette.login.gradient.bottom})`,
        color: theme.palette.login.main,
    },
    title: {
        fontSize: theme.fontSizes.mainHeader,
        marginBottom: '0.5rem',
        display: 'flex',
        alignItems: 'center',
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
        maxWidth: '300px',
    },
    imageContainer: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: '8rem',
    },
}));
