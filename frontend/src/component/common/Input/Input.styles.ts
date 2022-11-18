import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    helperText: {
        position: 'absolute',
        bottom: '-1rem',
    },
    inputContainer: {
        width: '100%',
        position: 'relative',
    },
}));
