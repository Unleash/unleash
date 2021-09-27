import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    addConstraintBtn: {
        color: theme.palette.primary.main,
        fontWeight: 'normal',
        marginBottom: '0.5rem',
    },
    constraintHeader: {
        fontWeight: 'bold',
        fontSize: theme.fontSizes.smallBody,
    },
    noConstraints: {
        marginTop: '0.5rem',
        fontSize: theme.fontSizes.smallBody,
    },
    constraint: {
        display: 'flex',
        alignItems: 'center',
        padding: '0.1rem 0.5rem',
        border: `1px solid ${theme.palette.grey[300]}`,
        borderRadius: '5px',
        fontSize: theme.fontSizes.smallBody,
        width: 'auto',
        margin: '0.5rem 0',
    },
    values: { marginLeft: '1.5rem' },
    contextName: {
        minWidth: '100px',
    },
}));
