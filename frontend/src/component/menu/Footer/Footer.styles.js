import { makeStyles } from '@material-ui/styles';

export const useStyles = makeStyles(theme => ({
    footer: {
        background: theme.palette.footer.background,
        padding: '2rem 4rem',
        width: '100%',
        flexGrow: 1,
        zIndex: 100,
    },
    list: {
        padding: 0,
        margin: 0,
    },
    listItem: {
        padding: 0,
        margin: 0,
        '& a': {
            textDecoration: 'none',
            color: theme.palette.footer.main,
        },
    },
}));
