import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    titleRowWrapper: {
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
    },
    titleRow: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: theme.spacing(1.5),
        marginTop: theme.spacing(1.5),
    },
    alertRow: {
        margin: theme.spacing(1, 0),
    },
    descriptionRow: {
        margin: theme.spacing(1, 0.5),
    },
    name: {
        fontWeight: 600,
        padding: theme.spacing(0.5),
    },
    icon: {
        textAlign: 'right',
    },
}));
