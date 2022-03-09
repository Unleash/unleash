import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
        [theme.breakpoints.down('xs')]: {
            justifyContent: 'center',
        },
    },
    apiError: {
        maxWidth: '400px',
        marginBottom: '1rem',
    },
    cardLink: {
        color: 'inherit',
        textDecoration: 'none',
        border: 'none',
        padding: '0',
        background: 'transparent',
        fontFamily: theme.typography.fontFamily,
        pointer: 'cursor',
    },
    searchBarContainer: {
        marginBottom: '2rem',
        display: 'flex',
        gap: '1rem',
        justifyContent: 'space-between',
        alignItems: 'center',
        [theme.breakpoints.down('xs')]: {
            display: 'block',
        },
    },
    searchBar: {
        minWidth: 450,
        [theme.breakpoints.down('xs')]: {
            minWidth: '100%',
        },
    },
}));
