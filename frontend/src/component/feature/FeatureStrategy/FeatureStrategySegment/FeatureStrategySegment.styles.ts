import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    divider: {
        border: `1px dashed ${theme.palette.divider}`,
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(2),
    },
}));
