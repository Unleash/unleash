import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    titleRowWrapper: {
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
    },
    titleRow: {
        display: 'inline-flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        gap: '12px',
        marginTop: '12px',
    },
    alertRow: {
        margin: theme.spacing(1, 0),
    },
    descriptionRow: {
        margin: theme.spacing(1, 0.5),
    },
    name: {
        fontWeight: 600,
        padding: '4px',
    },
    icon: {
        textAlign: 'right',
    },
}));
