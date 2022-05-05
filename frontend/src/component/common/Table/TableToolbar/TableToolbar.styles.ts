import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    root: {
        paddingLeft: theme.spacing(4),
        paddingRight: theme.spacing(4),
        paddingTop: theme.spacing(2.5),
        paddingBottom: theme.spacing(2.5),
        borderBottom: `1px solid ${theme.palette.divider}`,
        justifyContent: 'space-between',
    },
}));
