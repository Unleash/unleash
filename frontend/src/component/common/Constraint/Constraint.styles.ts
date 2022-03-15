import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    constraintHeader: {
        fontWeight: 'bold',
        fontSize: theme.fontSizes.smallBody,
    },
    constraint: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.1rem 0.5rem',
        fontSize: theme.fontSizes.smallBody,
        backgroundColor: theme.palette.grey[200],
        margin: '0.5rem 0',
        position: 'relative',
        borderRadius: '5px',
    },
    constraintBtn: {
        color: theme.palette.primary.main,
        fontWeight: 'normal',
        marginBottom: '0.5rem',
    },
    btnContainer: {
        position: 'absolute',
        top: '6px',
        right: 0,
    },
    column: {
        flexDirection: 'column',
    },
    values: {
        marginLeft: '1.5rem',
        whiteSpace: 'pre-wrap',
    },
}));
