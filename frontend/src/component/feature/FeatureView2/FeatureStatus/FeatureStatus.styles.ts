import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    container: {
        width: '42px',
        height: '42px',
        fontSize: '0.7em',
        background: 'gray',
        borderRadius: '3px',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '13px 10px',
    },
}));
