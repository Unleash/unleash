import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: theme.spacing(2),
    },
    title: {
        fontSize: theme.fontSizes.bodySize,
        textAlign: 'center',
        color: theme.palette.text.primary,
        marginBottom: theme.spacing(1),
    },
    description: {
        color: theme.palette.text.secondary,
        fontSize: theme.fontSizes.smallBody,
        textAlign: 'center',
        marginBottom: theme.spacing(3),
    },
}));
