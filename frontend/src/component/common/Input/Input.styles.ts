import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    helperText: {
        position: 'absolute',
        top: '35px',
    },
    inputContainer: {
        width: '100%',
        position: 'relative',
    },
}));
