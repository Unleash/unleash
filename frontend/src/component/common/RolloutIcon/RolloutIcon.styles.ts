import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    container: {
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        width: '50px',
        height: '100%',
        padding: '15px 0px',
    },
    vertical: {
        borderRadius: '1px',
        height: '50px',
        width: '50px',
    },
    circle: {
        width: '15px',
        height: '15px',
    },
    pos: {
        position: 'absolute',
        right: 0,
        left: 0,
        margin: '0 auto',
    },
}));
