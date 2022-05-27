import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    empty: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        margin: theme.spacing(6),
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    title: {
        fontSize: theme.fontSizes.mainHeader,
        marginBottom: theme.spacing(2.5),
    },
    subtitle: {
        fontSize: theme.fontSizes.smallBody,
        color: theme.palette.text.secondary,
        maxWidth: 515,
        marginBottom: theme.spacing(2.5),
        textAlign: 'center',
    },
    paramButton: {
        textDecoration: 'none',
        color: theme.palette.primary.main,
        fontWeight: theme.fontWeight.bold,
    },
}));
