import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    helperText: {
        position: 'absolute',
        bottom: '-1rem',
        whiteSpace: 'nowrap',
        maxWidth: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
}));
