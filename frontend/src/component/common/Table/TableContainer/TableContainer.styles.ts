import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    panel: {
        width: '100%',
        marginBottom: theme.spacing(2),
        borderRadius: theme.spacing(1.5),
        paddingBottom: theme.spacing(4),
    },
}));
