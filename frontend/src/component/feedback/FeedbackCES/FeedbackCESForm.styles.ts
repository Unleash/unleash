import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    container: {
        fontWeight: theme.fontWeight.thin,
    },
    form: {
        display: 'grid',
        gap: '3rem',
        gridTemplateColumns: 'minmax(auto, 40rem)',
        justifyContent: 'center',
    },
    title: {
        all: 'unset',
        display: 'block',
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
    subtitle: {
        all: 'unset',
        display: 'block',
        marginTop: '2.5rem',
        fontSize: '1.5rem',
        textAlign: 'center',
    },
    textLabel: {
        display: 'block',
        marginBottom: '0.5rem',
    },
    buttons: {
        textAlign: 'center',
    },
    button: {
        minWidth: '15rem',
    },
}));
