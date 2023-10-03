import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    inputRoot: {
        height: 48,
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        borderTopRightRadius: 50,
        borderBottomRightRadius: 50,
        '& fieldset': {
            borderColor: theme.palette.divider,
            borderLeftColor: 'transparent',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderWidth: 1,
        },
    },
}));
