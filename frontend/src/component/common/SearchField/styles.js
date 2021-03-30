import { makeStyles } from '@material-ui/styles';

export const useStyles = makeStyles(theme => ({
    search: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: theme.palette.searchField.main,
        borderRadius: theme.borders.radius.main,
        padding: '0.25rem 0.5rem',
        maxWidth: '450px',
        [theme.breakpoints.down('sm')]: {
            margin: '0 auto',
        },
        [theme.breakpoints.down('xs')]: {
            width: '100%',
        },
    },
    searchIcon: {
        marginRight: '8px',
    },
    inputRoot: {
        width: '100%',
    },
}));
