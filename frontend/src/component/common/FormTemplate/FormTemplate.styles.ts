import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    container: {
        minHeight: '80vh',
        width: '100%',
        display: 'flex',
        margin: '0 auto',
        borderRadius: '1rem',
        overflow: 'hidden',
        [theme.breakpoints.down(900)]: {
            flexDirection: 'column',
        },
    },
    modal: {
        minHeight: '100vh',
        borderRadius: 0,
    },
    sidebar: {
        backgroundColor: theme.palette.primary.light,
        padding: '2rem',
        width: '35%',
        [theme.breakpoints.down(900)]: {
            width: '100%',
        },
        [theme.breakpoints.down(500)]: {
            padding: '2rem 1rem',
        },
    },
    title: {
        color: '#fff',
        marginBottom: '1rem',
        fontWeight: 'normal',
    },
    subtitle: {
        color: '#fff',
        marginBottom: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontWeight: 'normal',
    },
    description: {
        color: '#fff',
    },
    linkContainer: {
        margin: '1.5rem 0',
        display: 'flex',
        alignItems: 'center',
    },
    linkIcon: {
        marginRight: '0.5rem',
        color: '#fff',
    },
    documentationLink: {
        color: '#fff',
        display: 'block',
    },
    formContent: {
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        padding: '2rem',
        width: '65%',
        [theme.breakpoints.down(900)]: {
            width: '100%',
        },
        [theme.breakpoints.down(500)]: {
            padding: '2rem 1rem',
        },
    },
    icon: { fill: '#fff' },
}));
