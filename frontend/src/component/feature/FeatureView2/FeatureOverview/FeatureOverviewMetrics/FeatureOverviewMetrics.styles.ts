import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    firstContainer: {
        width: 'calc(50% - 1rem)',
        marginRight: '1rem',
    },
    [theme.breakpoints.down(1000)]: {
        firstContainer: { width: '100%', marginRight: '0' },
    },
}));
