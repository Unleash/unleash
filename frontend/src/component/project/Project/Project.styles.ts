import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    containerStyles: {
        marginTop: '1.5rem',
        display: 'flex',
        [theme.breakpoints.down('sm')]: {
            flexDirection: 'column',
        },
    },
    projectToggles: { width: '100%', minHeight: '100%' },
    header: {
        backgroundColor: '#fff',
        borderRadius: '10px',
        marginBottom: '1rem',
    },
    innerContainer: { padding: '2rem' },
    separator: {
        width: '100%',
        backgroundColor: theme.palette.grey[200],
        height: '1px',
    },
    tabContainer: {
        padding: '1rem 2rem',
    },
    tabButton: {
        textTransform: 'none',
        width: 'auto',
        fontSize: '1rem',
    },
}));
