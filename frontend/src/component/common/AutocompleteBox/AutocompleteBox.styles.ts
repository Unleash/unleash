import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    container: {
        display: 'flex',
        alignItems: 'center',
        borderRadius: '1rem',
    },
    icon: {
        background: theme.palette.primary.main,
        height: 40,
        display: 'flex',
        alignItems: 'center',
        width: 40,
        justifyContent: 'center',
        paddingLeft: 6,
        borderTopLeftRadius: 40,
        borderBottomLeftRadius: 40,
        color: '#fff',
    },
    iconDisabled: {
        background: theme.palette.primary.light,
    },
    autocomplete: {
        flex: 1,
    },
    inputRoot: {
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        borderTopRightRadius: 50,
        borderBottomRightRadius: 50,
        '& fieldset': {
            borderColor: theme.palette.grey[300],
            borderLeftColor: 'transparent',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderWidth: 1,
        },
    },
}));
