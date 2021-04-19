import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '300px',
    },
    button: {
        width: '150px',
    },
}));
