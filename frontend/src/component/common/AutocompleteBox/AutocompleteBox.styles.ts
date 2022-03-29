import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    container: {
        display: 'flex',
        alignItems: 'center',
        borderRadius: '1rem',
    },
    icon: {
        background: theme.palette.primary.main,
        height: 56,
        display: 'flex',
        alignItems: 'center',
        width: 56,
        justifyContent: 'center',
        paddingLeft: 6,
        borderTopLeftRadius: 50,
        borderBottomLeftRadius: 50,
        color: '#fff',
    },
    autocomplete: {
        flex: 1,
    },
    inputRoot: {
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        '& fieldset': {
            borderColor: theme.palette,
            borderLeftColor: 'transparent',
        },
    },
}));
