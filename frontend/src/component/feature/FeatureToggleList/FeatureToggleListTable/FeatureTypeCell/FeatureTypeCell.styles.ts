import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    icon: {
        marginTop: theme.spacing(0.5),
        color: theme.palette.grey[600],
    },
}));
