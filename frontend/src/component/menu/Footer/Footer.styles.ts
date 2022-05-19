import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    footer: {
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
            color: theme.palette.text.primary,
        },
    },
}));
