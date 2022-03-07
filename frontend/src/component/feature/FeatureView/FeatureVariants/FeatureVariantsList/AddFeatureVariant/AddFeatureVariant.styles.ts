import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    error: {
        color: theme.palette.error.main,
        fontSize: theme.fontSizes.smallBody,
        position: 'relative',
    },
    input: {
        maxWidth: 350,
        width: '100%',
    },
    grid: {
        marginBottom: '0.5rem',
    },
    weightInput: {
        marginRight: '0.8rem',
    },
    label: { marginBottom: '1rem' },
    info: {
        width: '18.5px',
        height: '18.5px',
        color: 'grey',
    },
    select: {
        minWidth: '100px',
        width: '100%',
    },
}));
