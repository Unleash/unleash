import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    container: {
        boxShadow: 'none',
        marginLeft: '2rem',
        width: '100%',
        position: 'relative',
        [theme.breakpoints.down('sm')]: {
            marginLeft: '0',
            paddingBottom: '4rem',
        },
    },
    header: {
        padding: '1rem',
    },
    title: {
        fontSize: '1rem',
        fontWeight: 'normal',
    },
    iconButton: {
        marginRight: '1rem',
    },
    icon: {
        color: '#000',
        height: '30px',
        width: '30px',
    },
    noTogglesFound: {
        marginBottom: '0.5rem',
    },
    link: {
        textDecoration: 'none',
    },
}));
