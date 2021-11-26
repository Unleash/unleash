import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    loader: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
    },
    img: {
        width: '100px',
        height: '100px',
    },
}));
