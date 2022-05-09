import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    container: {
        width: '42px',
        height: '42px',
        fontSize: '0.7em',
        background: 'gray',
        borderRadius: theme.shape.borderRadius,
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '13px 10px',
    },
}));
