import { makeStyles } from '@material-ui/styles';

export const useStyles = makeStyles(theme => ({
    constraintContainer: {
        backgroundColor: theme.palette.cards.container.bg,
        margin: '0.5rem 0',
        borderRadius: theme.borders.radius.main,
        padding: '0.8rem',
        overflow: 'scroll',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    verticalSpacer: {
        margin: '0 0.25rem',
    },
    title: {
        fontWeight: theme.fontWeight.semi,
    },
    constraintDisplayContainer: {
        display: 'flex',
        flexDirection: 'column',
        width: '50%',
    },
    label: {
        fontWeight: theme.fontWeight.bold,
    },
    constraintValuesContainer: {
        marginTop: '0.25rem',
    },
    constraintValue: {
        marginRight: '0.25rem',
    },
}));
