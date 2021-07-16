import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    container: {
        margin: 'auto auto 0 auto',
        width: '230px',
        [theme.breakpoints.down('sm')]: {
            marginTop: '1rem',
        },
    },
    link: {
        textDecoration: 'none',
        fontWeight: 'bold',
        color: theme.palette.primary.main,
        textAlign: 'center',
    },
    text: { fontWeight: 'bold', marginBottom: '0.5rem' },
}));
