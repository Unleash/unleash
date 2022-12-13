import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    deleteInput: {
        marginTop: '1rem',
    },
    link: {
        textDecoration: 'none',
        color: theme.palette.primary.main,
        fontWeight: theme.fontWeight.bold,
    },
}));
