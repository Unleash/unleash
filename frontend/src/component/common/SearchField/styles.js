import { makeStyles } from '@material-ui/styles';

export const useStyles = makeStyles(theme => ({
    container: {
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
    },
    search: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: theme.palette.searchField.main,
        borderRadius: '25px',
        padding: '0.25rem 0.5rem',
        maxWidth: '450px',
        [theme.breakpoints.down('xs')]: {
            width: '100%',
        },
    },
    searchIcon: {
        marginRight: 8,
        color: theme.palette.grey[600],
    },
    inputRoot: {
        width: '100%',
    },
}));
