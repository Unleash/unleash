import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    title: {
        all: 'unset',
        display: 'block',
        margin: '1rem 0',
        fontSize: '1rem',
        fontWeight: theme.fontWeight.bold,
    },
}));
